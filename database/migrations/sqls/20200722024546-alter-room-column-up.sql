/* Replace with your SQL commands */
ALTER TABLE `room` 
ADD COLUMN `is_private` TINYINT NOT NULL DEFAULT 0 AFTER `file_name`;
ALTER TABLE `room` 
ADD COLUMN `password` VARCHAR(255) NULL AFTER `is_private`;
ALTER TABLE `room` 
ADD COLUMN `intro` VARCHAR(255) NULL DEFAULT 'none' AFTER `password`;
ALTER TABLE `room` 
CHANGE COLUMN `file_name` `filename` VARCHAR(45) NOT NULL DEFAULT 'Untitled' ;

