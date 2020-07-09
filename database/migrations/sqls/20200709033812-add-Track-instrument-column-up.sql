/* Replace with your SQL commands */
ALTER TABLE `track` 
ADD COLUMN `instrument` VARCHAR(45) NOT NULL DEFAULT 'piano' AFTER `room_id`;
