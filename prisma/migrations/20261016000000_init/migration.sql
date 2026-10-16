-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR') NOT NULL DEFAULT 'EDITOR',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_tokenHash_key`(`tokenHash`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curricula` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `curricula_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades` (
    `id` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grades_level_key`(`level`),
    UNIQUE INDEX `grades_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapters` (
    `id` VARCHAR(191) NOT NULL,
    `gradeId` VARCHAR(191) NOT NULL,
    `curriculumId` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `keyPoints` JSON NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chapters_gradeId_status_sortOrder_idx`(`gradeId`, `status`, `sortOrder`),
    UNIQUE INDEX `chapters_gradeId_slug_key`(`gradeId`, `slug`),
    UNIQUE INDEX `chapters_gradeId_curriculumId_number_key`(`gradeId`, `curriculumId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `id` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `knowledgeSummary` TEXT NULL,
    `example` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `topics_chapterId_status_sortOrder_idx`(`chapterId`, `status`, `sortOrder`),
    UNIQUE INDEX `topics_chapterId_slug_key`(`chapterId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gradeId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `difficulty` ENUM('BASIC', 'APPLIED', 'ADVANCED') NOT NULL,
    `type` ENUM('ESSAY', 'SINGLE_CHOICE', 'SHORT_ANSWER', 'TRUE_FALSE') NOT NULL,
    `content` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `solution` TEXT NOT NULL,
    `tags` JSON NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `source` TEXT NULL,
    `currentVersion` INTEGER NOT NULL DEFAULT 1,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `questions_code_key`(`code`),
    INDEX `questions_topicId_status_difficulty_idx`(`topicId`, `status`, `difficulty`),
    INDEX `questions_chapterId_status_difficulty_idx`(`chapterId`, `status`, `difficulty`),
    INDEX `questions_gradeId_status_idx`(`gradeId`, `status`),
    INDEX `questions_status_updatedAt_idx`(`status`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `question_options_questionId_label_key`(`questionId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `changeNote` TEXT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `question_revisions_questionId_version_key`(`questionId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_reports` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('OPEN', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    INDEX `question_reports_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `question_reports_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worksheets` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `kind` ENUM('CURATED', 'GENERATED') NOT NULL DEFAULT 'CURATED',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `gradeId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NULL,
    `topicId` VARCHAR(191) NULL,
    `difficulty` ENUM('BASIC', 'APPLIED', 'ADVANCED') NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 30,
    `questionCount` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `worksheets_slug_key`(`slug`),
    INDEX `worksheets_kind_status_gradeId_idx`(`kind`, `status`, `gradeId`),
    INDEX `worksheets_chapterId_kind_status_idx`(`chapterId`, `kind`, `status`),
    INDEX `worksheets_topicId_kind_status_idx`(`topicId`, `kind`, `status`),
    INDEX `worksheets_isFeatured_status_idx`(`isFeatured`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worksheet_questions` (
    `id` VARCHAR(191) NOT NULL,
    `worksheetId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `questionRevisionId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `worksheet_questions_questionId_idx`(`questionId`),
    UNIQUE INDEX `worksheet_questions_worksheetId_position_key`(`worksheetId`, `position`),
    UNIQUE INDEX `worksheet_questions_worksheetId_questionId_key`(`worksheetId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `downloads` (
    `id` VARCHAR(191) NOT NULL,
    `worksheetId` VARCHAR(191) NOT NULL,
    `kind` ENUM('QUESTION_PDF', 'ANSWER_PDF') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `downloads_worksheetId_kind_idx`(`worksheetId`, `kind`),
    INDEX `downloads_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curricula`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topics` ADD CONSTRAINT `topics_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_revisions` ADD CONSTRAINT `question_revisions_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_revisions` ADD CONSTRAINT `question_revisions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_reports` ADD CONSTRAINT `question_reports_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheets` ADD CONSTRAINT `worksheets_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheets` ADD CONSTRAINT `worksheets_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheets` ADD CONSTRAINT `worksheets_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheets` ADD CONSTRAINT `worksheets_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheet_questions` ADD CONSTRAINT `worksheet_questions_worksheetId_fkey` FOREIGN KEY (`worksheetId`) REFERENCES `worksheets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheet_questions` ADD CONSTRAINT `worksheet_questions_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worksheet_questions` ADD CONSTRAINT `worksheet_questions_questionRevisionId_fkey` FOREIGN KEY (`questionRevisionId`) REFERENCES `question_revisions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downloads` ADD CONSTRAINT `downloads_worksheetId_fkey` FOREIGN KEY (`worksheetId`) REFERENCES `worksheets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

