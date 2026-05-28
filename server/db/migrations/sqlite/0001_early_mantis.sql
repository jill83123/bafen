ALTER TABLE `image` RENAME COLUMN "r2_key" TO "storage_key";--> statement-breakpoint
DROP INDEX `image_r2_key_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `image_storage_key_unique` ON `image` (`storage_key`);