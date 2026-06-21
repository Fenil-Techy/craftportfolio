import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export interface DBUser {
  id: number;
  name: string;
  email: string;
  credits: number;
  clerkId: string | null;
}

/**
 * Gets or creates a user in the local database based on their Clerk profile.
 * Synchronizes the clerkId and email if they exist but aren't linked.
 */
export async function getOrCreateUser(clerkUser: any): Promise<DBUser | null> {
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  const clerkId = clerkUser.id;

  if (!email || !clerkId) return null;

  // 1. Try to find by clerkId
  let users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (users.length > 0) {
    return users[0] as DBUser;
  }

  // 2. Fallback to find by email (for existing users created before clerkId was added)
  users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (users.length > 0) {
    // Update the existing user with the new clerkId
    await db
      .update(usersTable)
      .set({ clerkId })
      .where(eq(usersTable.email, email));
    
    const updatedUser = { ...users[0], clerkId };
    return updatedUser as DBUser;
  }

  // 3. Insert new user
  const newUser = {
    name: clerkUser.fullName ?? "User",
    email: email,
    clerkId: clerkId,
    credits: 2,
  };

  const insertResult = await db
    .insert(usersTable)
    .values(newUser)
    .returning();

  return insertResult[0] as DBUser;
}
