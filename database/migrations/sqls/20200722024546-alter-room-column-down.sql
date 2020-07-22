/* Replace with your SQL commands */
/* Replace with your SQL commands */
ALTER TABLE `room` 
DROP COLUMN `is_private`;
ALTER TABLE `room` 
DROP COLUMN `password`;
ALTER TABLE `room` 
DROP COLUMN `intro`;
ALTER TABLE `room` 
CHANGE COLUMN `filename` `file_name` VARCHAR(45) NOT NULL DEFAULT 'Untitled' ;
