/* Replace with your SQL commands */
ALTER TABLE `chat` 
DROP FOREIGN KEY `fk_cr_room_id`;
ALTER TABLE `chat` 
DROP COLUMN `room_id`,
DROP INDEX `fk_cr_room_id_idx` ;
;
