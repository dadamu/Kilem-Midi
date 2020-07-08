/* Replace with your SQL commands */
CREATE TABLE `track` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `track_id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL DEFAULT 'New Track',
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `room_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_tr_room_id_idx` (`room_id` ASC) VISIBLE,
  INDEX `fk_tu_user_id_idx` (`creator_id` ASC) VISIBLE,
  CONSTRAINT `fk_tr_room_id`
    FOREIGN KEY (`room_id`)
    REFERENCES `room` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tu_user_id`
    FOREIGN KEY (`creator_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
