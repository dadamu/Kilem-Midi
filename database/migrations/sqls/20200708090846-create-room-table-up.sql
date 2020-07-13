CREATE TABLE `room` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NOT NULL DEFAULT 'Music',
  `file_name` VARCHAR(45) NOT NULL DEFAULT 'Untitled',
  `bpm` INT UNSIGNED NOT NULL DEFAULT 120,
  PRIMARY KEY (`id`),
  INDEX `fk_ru_user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_ru_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
