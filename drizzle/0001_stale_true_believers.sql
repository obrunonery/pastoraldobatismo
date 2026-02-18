CREATE TABLE `communications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`file_url` text,
	`date` text NOT NULL,
	`author_id` text,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`time` text,
	`location` text,
	`description` text,
	`status` text DEFAULT 'Agendado' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `formations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`facilitator` text,
	`content` text,
	`file_url` text
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`urgency` text DEFAULT 'medium' NOT NULL,
	`description` text,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`author_id` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`category` text DEFAULT 'Template' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
ALTER TABLE `minutes` ALTER COLUMN "content" TO "content" text;--> statement-breakpoint
ALTER TABLE `minutes` ADD `meeting_time` text;--> statement-breakpoint
ALTER TABLE `minutes` ADD `title` text;--> statement-breakpoint
ALTER TABLE `minutes` ADD `location` text;--> statement-breakpoint
ALTER TABLE `minutes` ADD `file_url` text;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `child_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `parent_names` text;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `godparents_names` text;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `scheduled_date` text;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `age` integer;--> statement-breakpoint
ALTER TABLE `baptisms` ADD `city` text;--> statement-breakpoint
ALTER TABLE `schedules` ADD `presence_status` text DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `marital_status` text;--> statement-breakpoint
ALTER TABLE `users` ADD `wedding_date` text;--> statement-breakpoint
ALTER TABLE `users` ADD `has_children` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `children_data` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sacraments` text;