CREATE TABLE "chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"frameId" varchar,
	"chatMessage" json,
	"createdBy" varchar,
	"createdOn" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "frames" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "frames_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"frameId" varchar NOT NULL,
	"designCode" text,
	"projectId" varchar,
	"createdOn" timestamp DEFAULT now(),
	CONSTRAINT "frames_frameId_unique" UNIQUE("frameId")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"projectId" varchar NOT NULL,
	"createdBy" varchar,
	"selectedModel" varchar,
	"createdOn" timestamp DEFAULT now(),
	CONSTRAINT "projects_projectId_unique" UNIQUE("projectId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer DEFAULT 2 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_frameId_frames_frameId_fk" FOREIGN KEY ("frameId") REFERENCES "public"."frames"("frameId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_projectId_projects_projectId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("projectId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_frame_id_idx" ON "chats" USING btree ("frameId");--> statement-breakpoint
CREATE INDEX "frame_project_id_idx" ON "frames" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_created_by_idx" ON "projects" USING btree ("createdBy");