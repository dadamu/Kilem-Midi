/* Replace with your SQL commands */
ALTER TABLE `track` 
ADD COLUMN `lock` TINYINT(1) NOT NULL DEFAULT 0 AFTER `instrument`;