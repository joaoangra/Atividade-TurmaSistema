/*
  Warnings:

  - You are about to drop the `atividade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `atividade` DROP FOREIGN KEY `Atividade_TurmaId_fkey`;

-- DropTable
DROP TABLE `atividade`;

-- CreateTable
CREATE TABLE `Atividades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `TurmaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Atividades` ADD CONSTRAINT `Atividades_TurmaId_fkey` FOREIGN KEY (`TurmaId`) REFERENCES `Turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
