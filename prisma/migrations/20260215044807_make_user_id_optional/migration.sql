-- DropForeignKey
ALTER TABLE `car` DROP FOREIGN KEY `Car_userId_fkey`;

-- DropIndex
DROP INDEX `Car_userId_fkey` ON `car`;

-- AlterTable
ALTER TABLE `car` MODIFY `userId` VARCHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `Car` ADD CONSTRAINT `Car_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
