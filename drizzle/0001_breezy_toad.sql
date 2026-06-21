ALTER TABLE "users" ADD COLUMN "clerkId" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId");
--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_createdBy_users_email_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_createdBy_users_email_fk";
--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "createdBy" TO "created_by_email";
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "createdBy" TO "created_by_email";
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "createdBy" integer;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "createdBy" integer;
--> statement-breakpoint
UPDATE "projects" p SET "createdBy" = u.id FROM "users" u WHERE p.created_by_email = u.email;
--> statement-breakpoint
UPDATE "chats" c SET "createdBy" = u.id FROM "users" u WHERE c.created_by_email = u.email;
--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "created_by_email";
--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "created_by_email";
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;