CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner" varchar(255) NOT NULL,
	"listing_id" integer NOT NULL,
	"date_range" jsonb NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_status_check" CHECK ("bookings"."status" IN ('pending', 'accepted', 'declined'))
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"owner" varchar(255) NOT NULL,
	"address" jsonb NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"thumbnail" text,
	"metadata" jsonb,
	"availability" jsonb DEFAULT '[]'::jsonb,
	"published" boolean DEFAULT false,
	"posted_on" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "listings_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"reviewer_email" varchar(255) NOT NULL,
	"booking_id" integer,
	"review_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"session_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_owner_users_email_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_users_email_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_email_users_email_fk" FOREIGN KEY ("reviewer_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_owner" ON "bookings" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "idx_bookings_listing" ON "bookings" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_owner" ON "listings" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "idx_listings_published" ON "listings" USING btree ("published");--> statement-breakpoint
CREATE INDEX "idx_reviews_listing" ON "reviews" USING btree ("listing_id");