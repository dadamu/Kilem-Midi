/* Replace with your SQL commands */
CREATE TABLE `save` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `room_id` BIGINT UNSIGNED NOT NULL,
  `data` VARCHAR(16384) NOT NULL DEFAULT '{}',
  PRIMARY KEY (`id`),
  INDEX `fk_su_user_id_idx` (`creator_id` ASC) VISIBLE,
  INDEX `fk_sr_room_id_idx` (`room_id` ASC) VISIBLE,
  CONSTRAINT `fk_su_user_id`
    FOREIGN KEY (`creator_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_sr_room_id`
    FOREIGN KEY (`room_id`)
    REFERENCES `room` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);;
