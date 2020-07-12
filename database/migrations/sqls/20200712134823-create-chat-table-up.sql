/* Replace with your SQL commands */
CREATE TABLE `chat` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATETIME NOT NULL,
  `msg` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_cu_user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_cu_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
