/* Replace with your SQL commands */
ALTER TABLE `track` 
ADD COLUMN `track_id` INT AFTER `id`;
ALTER TABLE `version` 
DROP FOREIGN KEY `fk_vt_track_pid`;
ALTER TABLE `version` 
CHANGE COLUMN `track_id` `track_pid` BIGINT UNSIGNED NOT NULL ;
ALTER TABLE `version` 
ADD CONSTRAINT `fk_vt_track_pid`
  FOREIGN KEY (`track_pid`)
  REFERENCES `track` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

