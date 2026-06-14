import { integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits:integer().default(2)
});

export const projectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  projectId: varchar().notNull().unique(),

  createdBy: varchar().references(() => usersTable.email),

  selectedModel: varchar(),

  createdOn: timestamp().defaultNow(),
});

export const frameTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().notNull().unique(),

  designCode: text(),

  projectId: varchar().references(() => projectTable.projectId),

  createdOn: timestamp().defaultNow(),
});

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().references(() => frameTable.frameId),

  chatMessage: json(),

  createdBy: varchar().references(() => usersTable.email),

  createdOn: timestamp().defaultNow(),
})