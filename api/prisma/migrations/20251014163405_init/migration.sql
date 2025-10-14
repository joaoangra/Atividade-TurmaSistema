-- DropForeignKey
ALTER TABLE `atividade` DROP FOREIGN KEY `Atividade_TurmaId_fkey`;

-- DropIndex
DROP INDEX `Atividade_TurmaId_fkey` ON `atividade`;

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_TurmaId_fkey` FOREIGN KEY (`TurmaId`) REFERENCES `Turma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
