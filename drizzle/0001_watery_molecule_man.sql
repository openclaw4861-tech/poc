CREATE TYPE "public"."constraint_type" AS ENUM('FS', 'SS', 'FF', 'SF');--> statement-breakpoint
CREATE TYPE "public"."dependency_type" AS ENUM('FS', 'SS', 'FF', 'SF');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('CREW', 'EQUIPMENT', 'MATERIAL');--> statement-breakpoint
CREATE TABLE "glass_lites" (
	"id" serial PRIMARY KEY NOT NULL,
	"measurement_id" integer NOT NULL,
	"lite_number" integer NOT NULL,
	"width" numeric(8, 4) NOT NULL,
	"height" numeric(8, 4) NOT NULL,
	"width_decimal" numeric(10, 6) NOT NULL,
	"height_decimal" numeric(10, 6) NOT NULL,
	"left_head" numeric(8, 4),
	"left_sill" numeric(8, 4),
	"right_head" numeric(8, 4),
	"right_sill" numeric(8, 4),
	"top_square" boolean DEFAULT true NOT NULL,
	"bottom_square" boolean DEFAULT true NOT NULL,
	"square_corners_note" varchar(100),
	"lite_shape" varchar(30) DEFAULT 'rectangular' NOT NULL,
	"glass_type" varchar(50),
	"glass_thickness" varchar(20),
	"lite_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(255) NOT NULL,
	"frame_number" varchar(50) NOT NULL,
	"number_of_lites" integer NOT NULL,
	"mullion_width" numeric(8, 4),
	"glass_bite_top" numeric(8, 4) DEFAULT '0.375' NOT NULL,
	"glass_bite_bottom" numeric(8, 4) DEFAULT '0.375' NOT NULL,
	"glass_bite_left" numeric(8, 4) DEFAULT '0.375' NOT NULL,
	"glass_bite_right" numeric(8, 4) DEFAULT '0.375' NOT NULL,
	"glass_type" varchar(50) DEFAULT 'Annealed' NOT NULL,
	"glass_thickness" varchar(20) DEFAULT '1/4"' NOT NULL,
	"frame_notes" text,
	"photo_url" varchar(500),
	"photo_caption" text,
	"level_to_head_left" numeric(8, 4) NOT NULL,
	"level_to_head_right" numeric(8, 4) NOT NULL,
	"level_to_sill_left" numeric(8, 4) NOT NULL,
	"level_to_sill_right" numeric(8, 4) NOT NULL,
	"plumb_to_left_head" numeric(8, 4) NOT NULL,
	"plumb_to_right_head" numeric(8, 4) NOT NULL,
	"plumb_to_left_sill" numeric(8, 4) NOT NULL,
	"plumb_to_right_sill" numeric(8, 4) NOT NULL,
	"level_to_head_joint_1" numeric(8, 4),
	"level_to_sill_joint_1" numeric(8, 4),
	"level_to_head_joint_2" numeric(8, 4),
	"level_to_sill_joint_2" numeric(8, 4),
	"level_to_head_joint_3" numeric(8, 4),
	"level_to_sill_joint_3" numeric(8, 4),
	"level_to_head_joint_4" numeric(8, 4),
	"level_to_sill_joint_4" numeric(8, 4),
	"level_to_head_joint_5" numeric(8, 4),
	"level_to_sill_joint_5" numeric(8, 4),
	"level_to_head_joint_6" numeric(8, 4),
	"level_to_sill_joint_6" numeric(8, 4),
	"level_to_head_joint_7" numeric(8, 4),
	"level_to_sill_joint_7" numeric(8, 4),
	"level_to_head_joint_8" numeric(8, 4),
	"level_to_sill_joint_8" numeric(8, 4),
	"level_to_head_joint_9" numeric(8, 4),
	"level_to_sill_joint_9" numeric(8, 4),
	"level_to_head_joint_10" numeric(8, 4),
	"level_to_sill_joint_10" numeric(8, 4),
	"level_to_head_joint_11" numeric(8, 4),
	"level_to_sill_joint_11" numeric(8, 4),
	"level_to_head_joint_12" numeric(8, 4),
	"level_to_sill_joint_12" numeric(8, 4),
	"level_to_head_joint_13" numeric(8, 4),
	"level_to_sill_joint_13" numeric(8, 4),
	"level_to_head_joint_14" numeric(8, 4),
	"level_to_sill_joint_14" numeric(8, 4),
	"level_to_head_joint_15" numeric(8, 4),
	"level_to_sill_joint_15" numeric(8, 4),
	"total_frame_width" numeric(8, 4) NOT NULL,
	"total_frame_height" numeric(8, 4) NOT NULL,
	"is_out_of_square" boolean DEFAULT false NOT NULL,
	"squareness_variance" numeric(8, 4),
	"measured_by" varchar(100) NOT NULL,
	"measured_at" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduling_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduling_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "resource_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduling_task_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduling_task_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"depends_on_task_id" integer NOT NULL,
	"type" "dependency_type" DEFAULT 'FS',
	"lag_days" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduling_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"parent_task_id" integer,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"duration_days" integer NOT NULL,
	"percent_complete" integer DEFAULT 0 NOT NULL,
	"constraint_type" "constraint_type" DEFAULT 'FS',
	"constraint_offset_days" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "glass_lites" ADD CONSTRAINT "glass_lites_measurement_id_measurements_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "public"."measurements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_resources" ADD CONSTRAINT "scheduling_resources_project_id_scheduling_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."scheduling_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_task_assignments" ADD CONSTRAINT "scheduling_task_assignments_task_id_scheduling_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."scheduling_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_task_assignments" ADD CONSTRAINT "scheduling_task_assignments_resource_id_scheduling_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."scheduling_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_task_dependencies" ADD CONSTRAINT "scheduling_task_dependencies_task_id_scheduling_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."scheduling_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_task_dependencies" ADD CONSTRAINT "scheduling_task_dependencies_depends_on_task_id_scheduling_tasks_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."scheduling_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_tasks" ADD CONSTRAINT "scheduling_tasks_project_id_scheduling_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."scheduling_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_measurement_id" ON "glass_lites" USING btree ("measurement_id");--> statement-breakpoint
CREATE INDEX "idx_lite_number" ON "glass_lites" USING btree ("lite_number");--> statement-breakpoint
CREATE INDEX "idx_job_name" ON "measurements" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX "idx_frame_number" ON "measurements" USING btree ("frame_number");--> statement-breakpoint
CREATE INDEX "idx_measured_at" ON "measurements" USING btree ("measured_at");--> statement-breakpoint
CREATE INDEX "sched_proj_name_idx" ON "scheduling_projects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sched_res_project_idx" ON "scheduling_resources" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sched_res_type_idx" ON "scheduling_resources" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sched_assign_task_idx" ON "scheduling_task_assignments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "sched_assign_res_idx" ON "scheduling_task_assignments" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "sched_dep_task_idx" ON "scheduling_task_dependencies" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "sched_dep_depends_idx" ON "scheduling_task_dependencies" USING btree ("depends_on_task_id");--> statement-breakpoint
CREATE INDEX "sched_task_project_idx" ON "scheduling_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sched_task_parent_idx" ON "scheduling_tasks" USING btree ("parent_task_id");--> statement-breakpoint
CREATE INDEX "sched_task_start_idx" ON "scheduling_tasks" USING btree ("start_date");