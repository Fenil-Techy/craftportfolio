import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, messageTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user-helper";

export async function PUT(req: NextRequest) {
  // 2.2 — Auth guard: require a valid Clerk session
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getOrCreateUser(user);
  if (!dbUser) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const { frameId, messages } = body;

  if (!frameId || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Bad Request: frameId and messages array required." },
      { status: 400 }
    );
  }

  // Verify the caller owns the project this frame belongs to
  const frameResult = await db
    .select({ projectId: frameTable.projectId })
    .from(frameTable)
    .where(eq(frameTable.frameId, frameId))
    .limit(1);

  if (frameResult.length === 0) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  const projectId = frameResult[0].projectId;
  if (!projectId) {
    return NextResponse.json({ error: "Frame has no associated project" }, { status: 400 });
  }

  const projectResult = await db
    .select()
    .from(projectTable)
    .where(
      and(
        eq(projectTable.projectId, projectId),
        eq(projectTable.createdBy, dbUser.id)
      )
    )
    .limit(1);

  if (projectResult.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Safe to update
  // Find the chatId
  const chatRecord = await db
    .select({ id: chatTable.id })
    .from(chatTable)
    .where(eq(chatTable.frameId, frameId))
    .limit(1);

  if (chatRecord.length === 0) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const chatId = chatRecord[0].id;

  // Perform atomic delete and insert in a transaction
  await db.transaction(async (tx) => {
    await tx.delete(messageTable).where(eq(messageTable.chatId, chatId));

    if (messages.length > 0) {
      await tx.insert(messageTable).values(
        messages.map((m: any, idx: number) => ({
          chatId,
          role: m.role,
          content: m.content,
          sequenceNumber: idx + 1,
        }))
      );
    }
  });

  return NextResponse.json({ result: "updated" });
}