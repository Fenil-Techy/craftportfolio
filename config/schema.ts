import { index, integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().notNull().default(2),
  maxCredits: integer().notNull().default(2),
  tier: varchar({ length: 50 }).notNull().default("free"),
  clerkId: varchar({ length: 255 }).unique()
});

export const projectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  projectId: varchar().notNull().unique(),

  title: varchar({ length: 255 }).default('Untitled Project'),

  createdBy: integer().references(() => usersTable.id),

  selectedModel: varchar(),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on createdBy so per-user project queries are O(log n)
  createdByIdx: index("project_created_by_idx").on(t.createdBy),
}));

export const frameTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().notNull().unique(),

  designCode: text(),

  projectId: varchar().references(() => projectTable.projectId),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on projectId so frame lookups by project are O(log n)
  projectIdIdx: index("frame_project_id_idx").on(t.projectId),
}));

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().references(() => frameTable.frameId),

  createdBy: integer().references(() => usersTable.id),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on frameId so chat lookups by frame are O(log n)
  frameIdIdx: index("chat_frame_id_idx").on(t.frameId),
}));

export const messageTable = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatId: integer().references(() => chatTable.id),
  role: varchar({ length: 50 }).notNull(),
  content: text().notNull(),
  createdAt: timestamp().defaultNow(),
  sequenceNumber: integer().notNull()
}, (t) => ({
  chatIdIdx: index("message_chat_id_idx").on(t.chatId),
}));

export const generationLogsTable = pgTable("generation_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),
  projectId: varchar(),
  model: varchar().notNull(),
  promptTokens: integer(),
  completionTokens: integer(),
  durationMs: integer(),
  mode: varchar({ length: 50 }),
  createdOn: timestamp().defaultNow(),
});