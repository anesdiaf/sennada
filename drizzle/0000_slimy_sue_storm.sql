CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`detailPrice` real,
	`wholesalePrice` real,
	`semiWSPrice` real,
	`stock` real,
	`isFollowStock` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
