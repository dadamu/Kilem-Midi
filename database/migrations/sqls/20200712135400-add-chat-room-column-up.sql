/* Replace with your SQL commands */
ALTER TABLE `chat` 
ADD COLUMN `room_id` BIGINT UNSIGNED NOT NULL AFTER `user_id`,
ADD INDEX `fk_cr_room_id_idx` (`room_id` ASC) VISIBLE;
ALTER TABLE `chat` 
ADD CONSTRAINT `fk_cr_room_id`
  FOREIGN KEY (`room_id`)
  REFERENCES `kilem_midi`.`room` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
