/* Replace with your SQL commands */
ALTER TABLE `track` 
DROP FOREIGN KEY `fk_tu_user_id`;
ALTER TABLE `track` 
ADD COLUMN `lock` TINYINT(1) NOT NULL DEFAULT 1 AFTER `instrument`,
CHANGE COLUMN `user_id` `user_id` BIGINT UNSIGNED NOT NULL ;
ALTER TABLE `track` 
ADD CONSTRAINT `fk_tu_user_id`
  FOREIGN KEY (`user_id`)
  REFERENCES `user` (`id`);