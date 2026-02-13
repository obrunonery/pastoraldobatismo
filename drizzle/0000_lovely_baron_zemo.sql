CREATE TABLE `baptisms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'Solicitado' NOT NULL,
	`date` text,
	`celebrant_id` text,
	`course_done` integer DEFAULT false NOT NULL,
	`docs_ok` integer DEFAULT false NOT NULL,
	`observations` text,
	FOREIGN KEY (`celebrant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `finance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`description` text NOT NULL,
	`date` text NOT NULL,
	`category` text
);
--> statement-breakpoint
CREATE TABLE `minutes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_date` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`baptism_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`role` text,
	FOREIGN KEY (`baptism_id`) REFERENCES `baptisms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'Ativo' NOT NULL
);
