import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable, projectTable, frameTable, chatTable, messageTable } from "@/config/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user-helper";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const { projectId } = await req.json();
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // 1. Fetch the project and verify ownership
    const projects = await db
      .select()
      .from(projectTable)
      .where(
        and(
          eq(projectTable.projectId, projectId),
          eq(projectTable.createdBy, dbUser.id)
        )
      );

    if (projects.length === 0) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    // 2. Fetch associated frames
    const frames = await db
      .select()
      .from(frameTable)
      .where(eq(frameTable.projectId, projectId));

    // 3. Verify if the generation actually failed (i.e. all frames have empty designCode)
    const hasGeneratedCode = frames.some(
      (f) => f.designCode && f.designCode.trim().length > 0
    );

    if (hasGeneratedCode) {
      return NextResponse.json(
        { error: "Cannot refund a project that has successfully generated code." },
        { status: 400 }
      );
    }

    // 4. Perform atomic credit refund and project cleanup sequentially
    // Increment user's credits by 1
    await db
      .update(usersTable)
      .set({ credits: sql`${usersTable.credits} + 1` })
      .where(eq(usersTable.id, dbUser.id));

    // Fetch chats to delete their messages
    for (const frame of frames) {
      const chats = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.frameId, frame.frameId));

      for (const chat of chats) {
        await db
          .delete(messageTable)
          .where(eq(messageTable.chatId, chat.id));
      }

      await db
        .delete(chatTable)
        .where(eq(chatTable.frameId, frame.frameId));
    }

    // Delete frames
    await db
      .delete(frameTable)
      .where(eq(frameTable.projectId, projectId));

    // Delete project
    await db
      .delete(projectTable)
      .where(eq(projectTable.projectId, projectId));

    return NextResponse.json({ success: true, refunded: true }, { status: 200 });

  } catch (error: any) {
    console.error("[REFUND_CREDIT_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
