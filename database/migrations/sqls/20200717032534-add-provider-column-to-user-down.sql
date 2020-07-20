/* Replace with your SQL commands */
ALTER TABLE `user` 
DROP COLUMN `provider`;
ALTER TABLE `user` 
CHANGE COLUMN `password` `password` VARCHAR(45) NULL DEFAULT NULL ;