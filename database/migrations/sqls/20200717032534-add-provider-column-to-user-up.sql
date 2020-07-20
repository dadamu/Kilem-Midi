/* Replace with your SQL commands */
ALTER TABLE `user` 
ADD COLUMN `provider` VARCHAR(45) NOT NULL DEFAULT 'native' AFTER `password`;
ALTER TABLE `user` 
CHANGE COLUMN `password` `password` VARCHAR(255) NULL DEFAULT NULL ;
