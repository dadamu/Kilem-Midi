/* Replace with your SQL commands */
ALTER TABLE `track` 
DROP COLUMN `track_id`;
ALTER TABLE `version` 
DROP FOREIGN KEY `fk_vt_track_pid`;
ALTER TABLE `version` 
CHANGE COLUMN `track_pid` `track_id` BIGINT UNSIGNED NOT NULL ;
ALTER TABLE `version` 
ADD CONSTRAINT `fk_vt_track_pid`
  FOREIGN KEY (`track_id`)
  REFERENCES `track` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

