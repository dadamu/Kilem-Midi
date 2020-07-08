/* Replace with your SQL commands */
CREATE TABLE `version` (
  `id` INT NOT NULL,
  `track_pid` BIGINT UNSIGNED NOT NULL,
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `version` INT UNSIGNED NOT NULL,
  `notes` VARCHAR(16384) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_vt_track_pid_idx` (`track_pid` ASC) VISIBLE,
  CONSTRAINT `fk_vt_track_pid`
    FOREIGN KEY (`track_pid`)
    REFERENCES `track` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_vu_user_id`
    FOREIGN KEY (`creator_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
