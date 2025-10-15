/*
  Warnings:

  - You are about to drop the column `TurmaId` on the `atividade` table. All the data in the column will be lost.
  - Added the required column `turma_id` to the `Atividade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `atividade` DROP FOREIGN KEY `Atividade_TurmaId_fkey`;

-- DropIndex
DROP INDEX `Atividade_TurmaId_fkey` ON `atividade`;

-- AlterTable
ALTER TABLE `atividade` DROP COLUMN `TurmaId`,
    ADD COLUMN `turma_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_turma_id_fkey` FOREIGN KEY (`turma_id`) REFERENCES `Turma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
