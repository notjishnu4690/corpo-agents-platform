CREATE TABLE `companyProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` text NOT NULL,
	`companyDescription` text NOT NULL,
	`selectedAgents` varchar(255) NOT NULL,
	`isOnboarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companyProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `companyProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `companyProfiles` ADD CONSTRAINT `companyProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;