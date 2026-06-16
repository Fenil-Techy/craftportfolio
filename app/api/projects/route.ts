import { db } from "@/config/db";
import {
  chatTable,
  frameTable,
  projectTable,
  usersTable,
} from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    projectId,
    frameId,
    messages,
    model,
  } = await req.json();

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get user's subscription
  const { has } = await auth();
  const hasUnlimitedAccess = has({ plan: "pro" });

  // Get latest credits from DB
  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const currentDbUser = dbUser[0];

  if (!currentDbUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Free users must have credits
  if (!hasUnlimitedAccess) {
    if (currentDbUser.credits <= 0) {
      return NextResponse.json(
        { error: "No credits left" },
        { status: 403 }
      );
    }

    // Deduct one credit
    await db
      .update(usersTable)
      .set({
        credits: currentDbUser.credits - 1,
      })
      .where(eq(usersTable.email, email));
  }

  // Create project
  await db.insert(projectTable).values({
    projectId,
    createdBy: email,
    selectedModel: model,
  });

  // Create frame
  await db.insert(frameTable).values({
    projectId,
    frameId,
  });

  // Save chat
  await db.insert(chatTable).values({
    chatMessage: messages,
    frameId,
    createdBy: email,
  });

  return NextResponse.json({
    projectId,
    frameId,
    messages,
    model,
  });
}