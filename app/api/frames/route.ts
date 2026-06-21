import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, messageTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helper";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const frameId = searchParams.get('frameId')
    const projectId = searchParams.get('projectId')

    const user = await currentUser();
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
        return NextResponse.json(
            { error: "User profile not found" },
            { status: 404 }
        );
    }

    if (!frameId) {
        return NextResponse.json(
            { error: "frameId is required" }, { status: 400 }
        )
    }

    const frameResult = await db
        .select()
        .from(frameTable)
        .where(eq(frameTable.frameId, frameId))

    const projectResult = await db
        .select()
        .from(projectTable)
        .where(
            and(
                eq(projectTable.projectId, projectId!),
                eq(projectTable.createdBy, dbUser.id)
            )
        );

    if (projectResult.length === 0) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }


    const chatResult = await db
        .select({ id: chatTable.id })
        .from(chatTable)
        .where(eq(chatTable.frameId, frameId))

    let chatMessages: { role: string; content: string }[] = [];
    if (chatResult.length > 0) {
        chatMessages = await db
            .select({
                role: messageTable.role,
                content: messageTable.content
            })
            .from(messageTable)
            .where(eq(messageTable.chatId, chatResult[0].id))
            .orderBy(messageTable.sequenceNumber);
    }

    const finalResult = {
        ...frameResult[0],
        chatMessages,
        selectedModel: projectResult[0]?.selectedModel,
    }

    return NextResponse.json(finalResult)
}

export async function PUT(req: NextRequest) {

    const { designCode, frameId, projectId } = await req.json()
    const user = await currentUser();
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
        return NextResponse.json(
            { error: "User profile not found" },
            { status: 404 }
        );
    }

    // 2.8 — Guard against oversized designCode payloads (max 500 KB)
    if (typeof designCode === "string" && designCode.length > 500_000) {
        return NextResponse.json(
            { error: "designCode exceeds maximum allowed size of 500KB." },
            { status: 413 }
        );
    }

    const project = await db
    .select()
    .from(projectTable)
    .where(
      and(
        eq(projectTable.projectId, projectId),
        eq(projectTable.createdBy, dbUser.id)
      )
    );

  if (project.length === 0) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

    const result = await db.update(frameTable).set({
        designCode: designCode
    }).where(and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId)))

    return NextResponse.json({ result: "Updated" })
}