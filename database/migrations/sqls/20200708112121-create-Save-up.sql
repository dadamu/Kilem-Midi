/* Replace with your SQL commands */
CREATE TABLE `save` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `room_id` BIGINT UNSIGNED NOT NULL,
  `data` TEXT NULL,
  PRIMARY KEY (`user_id`, `room_id`),
  CONSTRAINT `fk_su_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_sr_room_id`
    FOREIGN KEY (`room_id`)
    REFERENCES `room` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);;
