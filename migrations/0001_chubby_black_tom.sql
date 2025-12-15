ALTER TABLE "messages" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "image_url" text;