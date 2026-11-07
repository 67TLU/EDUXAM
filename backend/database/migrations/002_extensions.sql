-- =============================================================
-- Migration 002: Mở rộng schema cho hệ thống thi/khảo sát hoàn chỉnh
-- Chạy sau khi đã import dump-online_education_platform-*.sql
-- =============================================================

-- 1. Mở rộng enum loại câu hỏi (giữ nguyên các giá trị cũ)
ALTER TABLE `questions`
  MODIFY COLUMN `question_type` ENUM(
    'short_answer','long_answer','multiple_choice','multiple_select',
    'true_false','rating','date','file_upload',
    'fill_blank','ordering','matching'
  ) NOT NULL;

-- 2. Bảng ghi nhận sự kiện chống gian lận
CREATE TABLE IF NOT EXISTS `anti_cheat_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `submission_id` BIGINT NOT NULL,
  `event_type` ENUM('tab_switch','window_blur','copy_paste','right_click','devtools','fullscreen_exit') NOT NULL,
  `detail` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_anticheat_submission` (`submission_id`),
  CONSTRAINT `fk_anticheat_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng theo dõi ngườii tham gia phòng realtime (phòng khảo sát trực tiếp)
CREATE TABLE IF NOT EXISTS `room_participants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` TIMESTAMP NULL DEFAULT NULL,
  `last_seen_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_user_active` (`session_id`,`user_id`,`joined_at`),
  KEY `idx_participant_user` (`user_id`),
  CONSTRAINT `fk_participant_session` FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bổ sung cột cấu hình chống gian lận + xáo trộn cho phiên thi
ALTER TABLE `exam_sessions`
  ADD COLUMN `shuffle_questions` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `shuffle_options` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `anti_cheat` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `show_result` TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `passing_score` DECIMAL(10,2) NULL;

-- 5. Bảng file đính kèm (âm thanh, hình ảnh cho câu hỏi)
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT NULL,
  `form_id` BIGINT UNSIGNED NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `uploaded_by` BIGINT  NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_question` (`question_id`),
  CONSTRAINT `fk_media_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Index bổ sung cho hiệu năng báo cáo/thống kê
ALTER TABLE `submissions` ADD INDEX `idx_submission_session` (`session_id`);
ALTER TABLE `answers` ADD INDEX `idx_answer_question` (`question_id`);
ALTER TABLE `questions` ADD INDEX `idx_question_form` (`form_id`);
