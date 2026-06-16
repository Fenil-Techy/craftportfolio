import { db } from "@/config/db";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const frameId = searchParams.get('frameId')
    const projectId = searchParams.get('projectId')

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
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
                eq(projectTable.createdBy, email)
            )
        );

    if (projectResult.length === 0) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }


    const chatResult = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.frameId, frameId))

    const finalResult = {
        ...frameResult[0],
        chatMessages: chatResult[0]?.chatMessage ?? [],
        selectedModel: projectResult[0]?.selectedModel,
    }

    return NextResponse.json(finalResult)
}

export async function PUT(req: NextRequest) {

    const { designCode, frameId, projectId } = await req.json()
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    } 
    const project = await db
    .select()
    .from(projectTable)
    .where(
      and(
        eq(projectTable.projectId, projectId),
        eq(projectTable.createdBy, email)
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