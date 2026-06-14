import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const {
        projectId,
        frameId,
        messages,
        credits,
        model,          // ✅ ADD THIS
    } = await req.json();

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    await db.insert(projectTable).values({
        projectId,
        createdBy: email,
        selectedModel: model,    // ✅ SAVE IT
    });

    await db.insert(frameTable).values({
        projectId,
        frameId,
    });

    await db.insert(chatTable).values({
        chatMessage: messages,
        frameId,
        createdBy: email,
    });

    await db.update(usersTable)
        .set({
            credits: credits - 1,
        })
        .where(eq(usersTable.email, email));

    return NextResponse.json({
        projectId,
        frameId,
        messages,
        model,
    });
}