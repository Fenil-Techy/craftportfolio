import { db } from "@/config/db";
import {
  chatTable,
  frameTable,
  projectTable,
  usersTable,
  messageTable,
} from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, gt, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { v4 as uuidv4 } from "uuid";
import { getOrCreateUser } from "@/lib/user-helper";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user server-side
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
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

    const email = dbUser.email;

    // 2.4 — Rate limit: 5 project creations per 60 seconds per user
    const limited = await checkRateLimit(req, email, "projectCreation");
    if (limited) return limited;

    // 2. Parse and validate incoming payload parameters
    const body = await req.json();
    const { messages, model } = body;

    // 2.5 — Generate IDs server-side; never trust client-supplied primary keys
    const projectId = uuidv4();
    const frameId = uuidv4();

    if (!model || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Bad Request: Missing or malformed parameters" },
        { status: 400 }
      );
    }

    // 3. Evaluate Clerk tier status
    const { has } = await auth();
    const hasUnlimitedAccess = has({ plan: "pro" });

    // 4. Handle Credits check securely WITHOUT db.transaction
    if (!hasUnlimitedAccess) {
      // ATOMIC UPDATE: Deduct a credit using clean template literal sql string injections
      const updateResult = await db
        .update(usersTable)
        .set({
          // This maps natively to PostgreSQL: SET "credits" = "credits" - 1
          credits: sql`${usersTable.credits} - 1`, 
        })
        .where(
          and(
            eq(usersTable.id, dbUser.id),
            gt(usersTable.credits, 0) // Ensures user balance cannot pass under 0!
          )
        );
    
      // If rowCount is 0, the block intercepts script spammers safely
      if (updateResult.rowCount === 0) {
        return NextResponse.json(
          { error: "Insufficient credits. Generation blocked." },
          { status: 403 }
        );
      }
    }

    // 5. Execute core records instantiation safely since credits are verified
    await db.insert(projectTable).values({
      projectId,
      createdBy: dbUser.id,
      selectedModel: model,
    });

    await db.insert(frameTable).values({
      projectId,
      frameId,
    });

    const chatInsert = await db.insert(chatTable).values({
      frameId,
      createdBy: dbUser.id,
    }).returning({ id: chatTable.id });

    const chatId = chatInsert[0].id;

    if (messages && messages.length > 0) {
      await db.insert(messageTable).values(
        messages.map((m: any, idx: number) => ({
          chatId,
          role: m.role,
          content: m.content,
          sequenceNumber: idx + 1,
        }))
      );
    }

    // Return clean response back to client
    return NextResponse.json({
      projectId,
      frameId,
      messages,
      model,
    }, { status: 200 });

  } catch (error) {
    console.error("[PROTECTED_PROJECTS_POST_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}