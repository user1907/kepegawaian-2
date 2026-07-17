CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jabatan` (
	`kode_jabatan` varchar(20) NOT NULL,
	`nama_jabatan` varchar(100) NOT NULL,
	`level` int NOT NULL,
	`gaji` decimal(15,2) NOT NULL,
	`deleted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `jabatan_kode_jabatan` PRIMARY KEY(`kode_jabatan`)
);
--> statement-breakpoint
CREATE TABLE `jabatan_pegawai` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nip` varchar(20) NOT NULL,
	`kode_jabatan` varchar(20) NOT NULL,
	`status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
	`periode` varchar(50),
	`deleted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `jabatan_pegawai_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pegawai` (
	`nip` varchar(20) NOT NULL,
	`nama_lengkap` varchar(100) NOT NULL,
	`jenis_kelamin` enum('L','P') NOT NULL,
	`tanggal_lahir` date NOT NULL,
	`alamat` text,
	`no_hp` varchar(20),
	`email` varchar(100),
	`deleted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `pegawai_nip` PRIMARY KEY(`nip`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role` text DEFAULT ('staff'),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jabatan_pegawai` ADD CONSTRAINT `jabatan_pegawai_nip_pegawai_nip_fk` FOREIGN KEY (`nip`) REFERENCES `pegawai`(`nip`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jabatan_pegawai` ADD CONSTRAINT `jabatan_pegawai_kode_jabatan_jabatan_kode_jabatan_fk` FOREIGN KEY (`kode_jabatan`) REFERENCES `jabatan`(`kode_jabatan`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `jabatan_nama_idx` ON `jabatan` (`nama_jabatan`);--> statement-breakpoint
CREATE INDEX `jp_nip_idx` ON `jabatan_pegawai` (`nip`);--> statement-breakpoint
CREATE INDEX `jp_kode_jabatan_idx` ON `jabatan_pegawai` (`kode_jabatan`);--> statement-breakpoint
CREATE INDEX `pegawai_nama_idx` ON `pegawai` (`nama_lengkap`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);