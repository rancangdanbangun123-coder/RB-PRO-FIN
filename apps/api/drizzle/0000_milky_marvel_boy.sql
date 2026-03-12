CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'Project Manager' NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" text NOT NULL,
	"permission_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" text PRIMARY KEY DEFAULT '04bb5a5c-bb0e-4f67-a3c4-df4e6f76d7cc' NOT NULL,
	"project_id" text NOT NULL,
	"category" text,
	"sub_category" text,
	"description" text,
	"volume" text,
	"unit" text,
	"unit_price" bigint DEFAULT 0,
	"total_budget" bigint DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"provinsi_id" text,
	"kabupaten_id" text,
	"kecamatan_id" text,
	"client" text,
	"client_id" text,
	"pm" text,
	"pm_user_id" text,
	"status" text DEFAULT 'Ongoing' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"value" bigint DEFAULT 0,
	"cost" bigint DEFAULT 0,
	"margin" integer DEFAULT 0,
	"health" text DEFAULT 'Good',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"name" text NOT NULL,
	"qty" text,
	"unit" text,
	"price" bigint DEFAULT 0,
	"total" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"amount" bigint DEFAULT 0 NOT NULL,
	"date" date NOT NULL,
	"category" text,
	"sub_category" text,
	"account" text,
	"payee" text,
	"notes" text,
	"attachment_url" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"category_id" text,
	"sub_category" text,
	"sub_category_id" text,
	"price" bigint DEFAULT 0,
	"ahs_price" bigint DEFAULT 0,
	"unit" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"last_update" text,
	"trend" text,
	"trend_val" text,
	"plan" text,
	"base_unit" text,
	"conversion_factor" text,
	"standard_unit" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcontractor_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcontractor_id" text NOT NULL,
	"project_name" text,
	"po_number" text,
	"date" text,
	"status" text,
	"description" text,
	"amount" text
);
--> statement-breakpoint
CREATE TABLE "subcontractor_managers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcontractor_id" text NOT NULL,
	"name" text NOT NULL,
	"volume" text,
	"percent" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "subcontractor_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcontractor_id" text NOT NULL,
	"material_id" text NOT NULL,
	"price" bigint DEFAULT 0,
	"date" text
);
--> statement-breakpoint
CREATE TABLE "subcontractors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"type" text,
	"rating" text DEFAULT '0',
	"status" text DEFAULT 'Pending' NOT NULL,
	"logo" text,
	"pic" text,
	"phone" text,
	"email" text,
	"total_spend" bigint DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" text NOT NULL,
	"date" text,
	"event" text,
	"sub" text,
	"active" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "asset_request_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" text NOT NULL,
	"status" text,
	"date" text,
	"actor" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "asset_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text,
	"asset_name" text,
	"project_id" text,
	"project_name" text,
	"requester" text,
	"request_date" date,
	"status" text DEFAULT 'Pending' NOT NULL,
	"qty" integer DEFAULT 1,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "asset_stock_breakdown" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" text NOT NULL,
	"status" text,
	"condition" text,
	"location" text,
	"qty" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"detail_image" text,
	"category" text,
	"sub_category" text,
	"brand" text,
	"status" text DEFAULT 'Tersedia' NOT NULL,
	"location" text,
	"qty" integer DEFAULT 0,
	"serial_number" text,
	"purchase_year" text,
	"condition" text,
	"pic" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement_items" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text,
	"type" text,
	"procurement_type" text DEFAULT 'major' NOT NULL,
	"project" text,
	"project_id" text,
	"title" text NOT NULL,
	"stage" text DEFAULT 'pr' NOT NULL,
	"vol" text,
	"est" text,
	"urgent" boolean DEFAULT false,
	"fast_track" boolean DEFAULT false,
	"created" text,
	"created_by" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"raw_items" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"from_stage" text,
	"to_stage" text,
	"date" text,
	"form_data" jsonb DEFAULT '{}'::jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"step_number" integer NOT NULL,
	"label" text,
	"percent" text,
	"amount" bigint DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"paid_date" date,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"contact" text,
	"email" text,
	"address" text,
	"npwp" text,
	"initial" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"billing_step_id" uuid,
	"date" date,
	"description" text,
	"amount" bigint DEFAULT 0,
	"method" text,
	"reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kabupaten" (
	"id" text PRIMARY KEY NOT NULL,
	"provinsi_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kecamatan" (
	"id" text PRIMARY KEY NOT NULL,
	"kabupaten_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provinsi" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_sub_category_id_sub_categories_id_fk" FOREIGN KEY ("sub_category_id") REFERENCES "public"."sub_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractor_history" ADD CONSTRAINT "subcontractor_history_subcontractor_id_subcontractors_id_fk" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractor_managers" ADD CONSTRAINT "subcontractor_managers_subcontractor_id_subcontractors_id_fk" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractor_materials" ADD CONSTRAINT "subcontractor_materials_subcontractor_id_subcontractors_id_fk" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcontractor_materials" ADD CONSTRAINT "subcontractor_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_history" ADD CONSTRAINT "asset_history_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_request_history" ADD CONSTRAINT "asset_request_history_request_id_asset_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."asset_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_requests" ADD CONSTRAINT "asset_requests_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_requests" ADD CONSTRAINT "asset_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_stock_breakdown" ADD CONSTRAINT "asset_stock_breakdown_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_transitions" ADD CONSTRAINT "procurement_transitions_item_id_procurement_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."procurement_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_transitions" ADD CONSTRAINT "procurement_transitions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_steps" ADD CONSTRAINT "billing_steps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_billing_step_id_billing_steps_id_fk" FOREIGN KEY ("billing_step_id") REFERENCES "public"."billing_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kabupaten" ADD CONSTRAINT "kabupaten_provinsi_id_provinsi_id_fk" FOREIGN KEY ("provinsi_id") REFERENCES "public"."provinsi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kecamatan" ADD CONSTRAINT "kecamatan_kabupaten_id_kabupaten_id_fk" FOREIGN KEY ("kabupaten_id") REFERENCES "public"."kabupaten"("id") ON DELETE cascade ON UPDATE no action;