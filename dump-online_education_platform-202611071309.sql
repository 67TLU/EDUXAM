-- MySQL dump 10.13  Distrib 9.5.0, for Win64 (x86_64)
--
-- Host: localhost    Database: online_education_platform
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e0ed5213-b576-11f0-93c3-6c4b905ec4ea:1-2069';

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submission_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `answer_text` longtext COLLATE utf8mb4_unicode_ci,
  `answer_json` json DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_awarded` decimal(8,2) DEFAULT '0.00',
  `graded_by` bigint DEFAULT NULL,
  `graded_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `submission_id` (`submission_id`,`question_id`),
  KEY `graded_by` (`graded_by`),
  KEY `idx_answer_question` (`question_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  CONSTRAINT `answers_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (1,1,3,NULL,'{\"selectedOptionId\": 2}',1,2.50,NULL,NULL,'2026-11-05 07:31:01','2026-11-05 11:24:14'),(2,1,4,NULL,'{\"selectedOptionIds\": [5, 6]}',1,2.50,NULL,NULL,'2026-11-05 07:31:01','2026-11-05 11:24:14'),(3,1,5,NULL,NULL,1,2.50,NULL,NULL,'2026-11-05 07:31:01','2026-11-05 11:24:14'),(4,1,6,'SQL lưu dữ liệu dạng bảng quan hệ, NoSQL lưu dữ liệu dạng tài liệu JSON không ràng buộc schema cứng.','{\"order\": [\"2\", \"√5\", \"3\", \"π\"]}',NULL,0.00,NULL,NULL,'2026-11-05 07:31:01','2026-11-05 11:24:14'),(7,1,7,'Áp dụng bất đẳng thức Cô-si: (a+b)/2 ≥ √(ab). Dấu bằng xảy ra khi a=b.',NULL,NULL,0.00,NULL,NULL,'2026-11-05 11:24:14','2026-11-05 11:24:14'),(8,1,8,NULL,'{\"rating\": 4}',NULL,0.00,NULL,NULL,'2026-11-05 11:24:14','2026-11-05 11:24:14'),(15,6,3,NULL,'{\"selectedOptionId\": 9}',0,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31'),(16,6,4,NULL,'{\"selectedOptionId\": 11}',0,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31'),(17,6,5,NULL,'{\"selectedOptionId\": 16}',0,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31'),(18,6,6,'C',NULL,0,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31'),(19,6,9,NULL,'{\"rating\": 4}',NULL,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31'),(20,6,11,'á',NULL,NULL,0.00,NULL,NULL,'2026-11-06 01:16:31','2026-11-06 01:16:31');
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anti_cheat_events`
--

DROP TABLE IF EXISTS `anti_cheat_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anti_cheat_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `submission_id` bigint NOT NULL,
  `event_type` enum('tab_switch','window_blur','copy_paste','right_click','devtools','fullscreen_exit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_anticheat_submission` (`submission_id`),
  CONSTRAINT `fk_anticheat_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anti_cheat_events`
--

LOCK TABLES `anti_cheat_events` WRITE;
/*!40000 ALTER TABLE `anti_cheat_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `anti_cheat_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'START_EXAM','Exams',101,'Thí sinh bắt đầu làm bài thi Học kỳ 1','192.168.1.15','2026-11-06 00:51:55'),(2,1,'SUBMIT_EXAM','Submissions',5002,'Thí sinh đã nộp bài thành công, đạt 8/10 điểm','192.168.1.15','2026-11-06 00:52:04');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_members`
--

DROP TABLE IF EXISTS `class_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_members` (
  `class_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `member_role` enum('teacher','student') COLLATE utf8mb4_unicode_ci NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `class_members_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_members`
--

LOCK TABLES `class_members` WRITE;
/*!40000 ALTER TABLE `class_members` DISABLE KEYS */;
INSERT INTO `class_members` VALUES (1,2,'teacher','2026-11-04 13:52:56'),(1,3,'student','2026-11-04 13:52:56'),(1,4,'student','2026-11-05 11:22:36'),(1,5,'student','2026-11-05 11:22:36'),(2,2,'teacher','2026-11-05 11:22:36'),(2,6,'student','2026-11-05 11:22:36'),(2,7,'student','2026-11-05 11:22:36'),(3,3,'teacher','2026-11-05 11:22:36'),(3,8,'student','2026-11-05 11:22:36');
/*!40000 ALTER TABLE `class_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `school_id` bigint DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `join_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `join_code` (`join_code`),
  KEY `school_id` (`school_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL,
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,1,'10A1','Lop hoc demo','CLASS12A1',2,'active','2026-11-04 13:52:56'),(2,1,'10A2','Khối 10 - Ban Cơ bản','CLS10A2',2,'active','2026-11-05 11:22:36'),(3,1,'11A1','Khối 11 - Ban Tự nhiên','CLS11A1',3,'active','2026-11-05 11:22:36');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_sessions`
--

DROP TABLE IF EXISTS `exam_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `form_version_id` bigint NOT NULL,
  `created_by` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_type` enum('survey','exam') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `attempts_allowed` int DEFAULT '1',
  `status` enum('scheduled','active','finished','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT '0',
  `shuffle_options` tinyint(1) NOT NULL DEFAULT '0',
  `anti_cheat` tinyint(1) NOT NULL DEFAULT '0',
  `show_result` tinyint(1) NOT NULL DEFAULT '1',
  `passing_score` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_code` (`access_code`),
  KEY `form_version_id` (`form_version_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_sessions_status` (`status`),
  KEY `idx_sessions_form` (`form_id`),
  CONSTRAINT `exam_sessions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`),
  CONSTRAINT `exam_sessions_ibfk_2` FOREIGN KEY (`form_version_id`) REFERENCES `form_versions` (`id`),
  CONSTRAINT `exam_sessions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_sessions`
--

LOCK TABLES `exam_sessions` WRITE;
/*!40000 ALTER TABLE `exam_sessions` DISABLE KEYS */;
INSERT INTO `exam_sessions` VALUES (1,1,1,4,'Kiểm tra giữa kỳ Toán 10 - Ca 1','JS2026','exam','2026-11-05 08:00:00','2026-11-05 10:00:00',30,1,'active','2026-11-04 13:52:57',0,0,0,1,NULL),(2,2,2,1,'Kiểm tra giữa kỳ Toán 10 - Ca 2','263EE0','exam',NULL,NULL,45,1,'active','2026-11-05 01:49:40',0,0,0,1,NULL),(3,2,2,2,'Khảo sát trực tiếp tuần 41','SVY41','survey','2026-11-04 11:24:14','2026-11-10 11:24:14',NULL,1,'active','2026-11-05 11:24:14',0,0,0,0,NULL);
/*!40000 ALTER TABLE `exam_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_versions`
--

DROP TABLE IF EXISTS `form_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_versions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `version_number` int NOT NULL,
  `snapshot_json` json NOT NULL,
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `form_id` (`form_id`,`version_number`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `form_versions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `form_versions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_versions`
--

LOCK TABLES `form_versions` WRITE;
/*!40000 ALTER TABLE `form_versions` DISABLE KEYS */;
INSERT INTO `form_versions` VALUES (1,1,1,'{\"questions\": [{\"id\": 1, \"title\": \"Tính đạo hàm của hàm số y = x² + 3x tại x = 1.\", \"points\": \"2.00\", \"form_id\": 1, \"settings\": null, \"created_at\": \"2026-11-04T20:52:57.000Z\", \"sort_order\": 1, \"description\": null, \"is_required\": 1, \"question_type\": \"multiple_choice\"}, {\"id\": 2, \"title\": \"Chọn các hàm số nào sau đây đồng biến trên ℝ?\", \"points\": \"2.00\", \"form_id\": 1, \"settings\": null, \"created_at\": \"2026-11-04T20:52:57.000Z\", \"sort_order\": 2, \"description\": null, \"is_required\": 1, \"question_type\": \"true_false\"}, {\"id\": 7, \"title\": \"Chứng minh rằng với mọi a, b > 0 ta có: (a+b)/2 ≥ √(ab).\", \"points\": \"3.00\", \"form_id\": 1, \"settings\": {}, \"created_at\": \"2026-11-05T18:22:36.000Z\", \"sort_order\": 7, \"description\": null, \"is_required\": 1, \"question_type\": \"long_answer\"}, {\"id\": 8, \"title\": \"Bạn đánh giá mức độ khó của đề thi này như thế nào?\", \"points\": \"0.00\", \"form_id\": 1, \"settings\": {\"max\": 5}, \"created_at\": \"2026-11-05T18:22:36.000Z\", \"sort_order\": 8, \"description\": null, \"is_required\": 0, \"question_type\": \"rating\"}]}',2,'2026-11-04 13:52:57'),(2,2,1,'{\"questions\": [{\"id\": 3, \"title\": \"Phát biểu: \'Hàm số y = x³ có cực trị tại x = 0\' là đúng hay sai?\", \"points\": \"2.50\", \"form_id\": 2, \"settings\": null, \"created_at\": \"2026-11-05T08:41:21.000Z\", \"sort_order\": 1, \"description\": null, \"is_required\": 1, \"question_type\": \"multiple_choice\"}, {\"id\": 4, \"title\": \"Điền vào chỗ trống: Nếu hàm số f(x) liên tục trên [a;b] và f(a).f(b) < 0 thì phương trình f(x) = 0 có ít nhất ____ nghiệm trong khoảng (a;b).\", \"points\": \"2.50\", \"form_id\": 2, \"settings\": null, \"created_at\": \"2026-11-05T14:31:01.000Z\", \"sort_order\": 2, \"description\": null, \"is_required\": 1, \"question_type\": \"multiple_choice\"}, {\"id\": 5, \"title\": \"Tính giá trị của biểu thức: 2⁵ − 5²\", \"points\": \"2.50\", \"form_id\": 2, \"settings\": null, \"created_at\": \"2026-11-05T14:31:01.000Z\", \"sort_order\": 3, \"description\": null, \"is_required\": 1, \"question_type\": \"true_false\"}, {\"id\": 6, \"title\": \"Sắp xếp các số sau theo thứ tự tăng dần: 2; √5; 3; π\", \"points\": \"2.50\", \"form_id\": 2, \"settings\": null, \"created_at\": \"2026-11-05T14:31:01.000Z\", \"sort_order\": 4, \"description\": null, \"is_required\": 0, \"question_type\": \"short_answer\"}, {\"id\": 9, \"title\": \"Bạn đánh giá mức độ hài lòng về nội dung bài giảng?\", \"points\": \"0.00\", \"form_id\": 2, \"settings\": {\"max\": 5}, \"created_at\": \"2026-11-05T18:22:36.000Z\", \"sort_order\": 9, \"description\": null, \"is_required\": 0, \"question_type\": \"rating\"}, {\"id\": 10, \"title\": \"Thứ 2 tuần sau bạn có tham gia buổi ôn tập không?\", \"points\": \"0.00\", \"form_id\": 2, \"settings\": {}, \"created_at\": \"2026-11-05T18:22:36.000Z\", \"sort_order\": 10, \"description\": null, \"is_required\": 0, \"question_type\": \"multiple_choice\"}, {\"id\": 11, \"title\": \"Bạn có góp ý gì để giờ học tốt hơn?\", \"points\": \"0.00\", \"form_id\": 2, \"settings\": {}, \"created_at\": \"2026-11-05T18:22:36.000Z\", \"sort_order\": 11, \"description\": null, \"is_required\": 0, \"question_type\": \"long_answer\"}]}',1,'2026-11-05 01:39:42'),(3,3,1,'{\"title\": \"Bài tập về nhà\", \"version\": 1, \"questions\": []}',1,'2026-11-05 12:15:49'),(4,4,1,'{\"title\": \"Người Phán Xử\", \"version\": 1, \"questions\": []}',4,'2026-11-06 01:10:54');
/*!40000 ALTER TABLE `form_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `owner_id` bigint NOT NULL,
  `school_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `form_type` enum('survey','quiz','exam') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `idx_forms_owner` (`owner_id`),
  KEY `idx_forms_type_status` (`form_type`,`status`),
  CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `forms_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (1,2,1,'Đề kiểm tra giữa kỳ môn Toán 10','Bai kiem tra JavaScript co ban','exam','published','{\"showResult\": true, \"allowReview\": true, \"shuffleQuestions\": false}','2026-11-04 13:52:57','2026-11-05 11:22:36'),(2,1,NULL,'Khảo sát chất lượng giảng dạy','Kiểm tra kiến thức cơ bản về NodeJS và React','exam','published','{\"timeLimit\": 30, \"shuffleQuestions\": true}','2026-11-05 01:39:42','2026-11-05 11:22:36'),(3,1,NULL,'Bài tập về nhà',NULL,'survey','draft',NULL,'2026-11-05 12:15:49','2026-11-05 12:16:40'),(4,4,NULL,'Người Phán Xử','Làm nhớ kĩ cái mồn vào','exam','draft','{\"theme\": {\"primary_color\": \"#000000\"}, \"anti_cheat\": {\"max_tab_switch\": 3, \"track_tab_switch\": true, \"disable_copy_paste\": true, \"auto_submit_on_limit\": true}, \"pass_score\": 0, \"show_result\": \"after_publish\", \"instructions\": \"123123\", \"max_attempts\": 1, \"shuffle_options\": true, \"shuffle_questions\": true, \"time_limit_minutes\": 0}','2026-11-06 01:10:54','2026-11-06 01:12:14');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submission_id` bigint NOT NULL,
  `grader_id` bigint NOT NULL,
  `total_score` decimal(10,2) NOT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','graded','published') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `graded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grader_id` (`grader_id`),
  KEY `idx_grades_submission` (`submission_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`grader_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question_id` bigint DEFAULT NULL,
  `form_id` bigint unsigned DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int unsigned NOT NULL DEFAULT '0',
  `uploaded_by` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_question` (`question_id`),
  KEY `fk_media_uploader` (`uploaded_by`),
  CONSTRAINT `fk_media_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'Bai kiem tra moi','Bạn đạt 6/8 điểm kiểm tra giữa kỳ Toán 10.','exam',0,'2026-11-04 13:52:57'),(2,2,'He thong san sang','Ca 2 bắt đầu sau 1 ngày, mã tham gia MATH10B.','system',0,'2026-11-04 13:52:57'),(3,5,'Kết quả bài thi','Bạn đạt 8/8 điểm kiểm tra giữa kỳ Toán 10. Xin chúc mừng!','result',1,'2026-11-05 11:24:14'),(4,5,'Nộp bài thành công','Bài \"Kiểm tra giữa kỳ Toán 10 - Ca 2\" đã được nộp. Tổng điểm tạm tính: 0/10.','result',1,'2026-11-06 01:16:31');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'user.view','Xem ngưởi dùng','Xem người dùng'),(2,'user.create','Create Users','Tạo người dùng'),(3,'user.update','Update Users','Sửa người dùng'),(4,'user.delete','Delete Users','Xóa người dùng'),(5,'class.view','Xem lớp học','Xem lớp học'),(6,'class.create','Create Classes','Tạo lớp học'),(7,'class.update','Update Classes','Sửa lớp học'),(8,'class.delete','Delete Classes','Xóa lớp học'),(9,'form.view','Xem biểu mẫu','Xem biểu mẫu'),(10,'form.create','Tạo biểu mẫu','Tạo biểu mẫu'),(11,'form.update','Sửa biểu mẫu','Sửa biểu mẫu'),(12,'form.delete','Xóa biểu mẫu','Xóa biểu mẫu'),(13,'form.publish','Xuất bản biểu mẫu','Xuất bản biểu mẫu'),(14,'exam.view','View Exams','Xem kỳ thi'),(15,'exam.create','Tạo kỳ thi','Tạo kỳ thi'),(16,'exam.manage','Manage Exams','Quản lý kỳ thi'),(17,'exam.submit','Làm bài thi','Nộp bài thi'),(18,'grade.view','View Grades','Xem điểm'),(19,'grade.manage','Manage Grades','Chấm điểm'),(20,'report.view','Xem báo cáo','Xem báo cáo'),(21,'report.export','Xuất báo cáo','Xuất báo cáo'),(23,'user.manage','Quản lý ngưởi dùng',NULL),(25,'class.manage','Quản lý lớp học',NULL),(32,'exam.monitor','Giám sát phòng thi',NULL),(34,'exam.grade','Chấm điểm',NULL),(37,'admin.access','Trang quản trị',NULL);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `option_text` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_options_question` (`question_id`),
  CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
INSERT INTO `question_options` VALUES (1,1,'3',1,1),(2,1,'5',0,2),(3,1,'7',0,3),(4,1,'2',0,4),(5,2,'y = x³ + x',1,1),(6,2,'y = 2x + 1',0,2),(7,3,'y = x²',1,1),(8,3,'y = 1/x',0,2),(9,3,'Đúng',0,3),(10,3,'Sai',0,4),(11,4,'7',0,1),(12,4,'Có tham gia',1,2),(13,4,'Không tham gia',0,3),(14,4,'useReducer',0,4),(15,5,'Đúng',1,1),(16,5,'Sai',0,2),(17,12,'Không bé ơi',0,0),(18,12,'Có cái nịt',0,1),(19,12,'123',0,2),(20,12,'123',0,3),(23,14,'Khum bít',1,0),(24,14,'Hong',0,1),(25,13,'Khum bít',1,0),(26,13,'Hong',0,1);
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `question_type` enum('short_answer','long_answer','multiple_choice','multiple_select','true_false','rating','date','file_upload','fill_blank','ordering','matching') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_required` tinyint(1) DEFAULT '0',
  `points` decimal(8,2) DEFAULT '0.00',
  `sort_order` int DEFAULT '0',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_form_order` (`form_id`,`sort_order`),
  KEY `idx_question_form` (`form_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'multiple_choice','Tính đạo hàm của hàm số y = x² + 3x tại x = 1.',NULL,1,2.00,1,NULL,'2026-11-04 13:52:57'),(2,1,'true_false','Chọn các hàm số nào sau đây đồng biến trên ℝ?',NULL,1,2.00,2,NULL,'2026-11-04 13:52:57'),(3,2,'multiple_choice','Phát biểu: \'Hàm số y = x³ có cực trị tại x = 0\' là đúng hay sai?',NULL,1,2.50,1,NULL,'2026-11-05 01:41:21'),(4,2,'multiple_choice','Điền vào chỗ trống: Nếu hàm số f(x) liên tục trên [a;b] và f(a).f(b) < 0 thì phương trình f(x) = 0 có ít nhất ____ nghiệm trong khoảng (a;b).',NULL,1,2.50,2,NULL,'2026-11-05 07:31:01'),(5,2,'true_false','Tính giá trị của biểu thức: 2⁵ − 5²',NULL,1,2.50,3,NULL,'2026-11-05 07:31:01'),(6,2,'short_answer','Sắp xếp các số sau theo thứ tự tăng dần: 2; √5; 3; π',NULL,0,2.50,4,NULL,'2026-11-05 07:31:01'),(7,1,'long_answer','Chứng minh rằng với mọi a, b > 0 ta có: (a+b)/2 ≥ √(ab).',NULL,1,3.00,7,'{}','2026-11-05 11:22:36'),(8,1,'rating','Bạn đánh giá mức độ khó của đề thi này như thế nào?',NULL,0,0.00,8,'{\"max\": 5}','2026-11-05 11:22:36'),(9,2,'rating','Bạn đánh giá mức độ hài lòng về nội dung bài giảng?',NULL,0,0.00,9,'{\"max\": 5}','2026-11-05 11:22:36'),(10,2,'multiple_choice','Thứ 2 tuần sau bạn có tham gia buổi ôn tập không?',NULL,0,0.00,10,'{}','2026-11-05 11:22:36'),(11,2,'long_answer','Bạn có góp ý gì để giờ học tốt hơn?',NULL,0,0.00,11,'{}','2026-11-05 11:22:36'),(12,3,'multiple_choice','Câu 1.Đâu là thủ phủ IT duy nhất',NULL,1,0.00,1,NULL,'2026-11-05 12:16:40'),(13,4,'multiple_choice','AI là người đặt tên cho sông hằng',NULL,0,1.00,1,NULL,'2026-11-06 01:11:27'),(14,4,'multiple_choice','AI là người đặt tên cho sông hằng',NULL,0,1.00,2,NULL,'2026-11-06 01:11:34');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `family_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `replaced_by_token_id` bigint DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `revoked_reason` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  KEY `idx_refresh_expires` (`expires_at`),
  KEY `idx_refresh_family` (`family_id`),
  KEY `fk_refresh_replaced_by` (`replaced_by_token_id`),
  CONSTRAINT `fk_refresh_replaced_by` FOREIGN KEY (`replaced_by_token_id`) REFERENCES `refresh_tokens` (`id`) ON DELETE SET NULL,
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,1,'3060a62e-24f2-45fd-a00d-3e24df8fbdb5','8ce9780d100951bc6d72ca8d88cef891e718e388d5b65ee859bee4e824cb5569','2026-11-12 00:40:51','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:40:51'),(2,1,'9b99674e-4676-45d2-a8a3-ef16fe132934','0a6407efeacb404774dc736f8f2c306fda3d7d899b8b52d1bc90381a4c2b12d0','2026-11-12 00:42:50','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:42:50'),(3,1,'d517ba1c-8d58-4278-8a6d-2c6a81e5bed2','d83020217dc1fa7a1c14d401ba7dc4a60c5c2ab64a8cc7d4060c425eb9091a9f','2026-11-12 00:43:59','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:43:59'),(4,1,'bf628d1e-9ef4-41de-8a3f-edbef19108a4','3caa349f09fd59ecd025c71795cc956f387050a842fb90060a44b15ba43725e0','2026-11-12 00:44:36','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:44:36'),(5,1,'3421c45f-a810-4ee4-bb87-9f60c881c19a','a6ff0f3c038b205a41581b5fd9c7fd06166417333809c1fc7e53e9c78ffacfb2','2026-11-12 00:44:55','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:44:55'),(6,1,'7b639eb6-f3b7-4b5e-a225-035839ba9da7','ad8d429a45838b1a9962b6e7f4a8d29cc63a55087610938393d86b78a63fb9e9','2026-11-12 00:44:56','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:44:56'),(7,1,'77794ae5-a921-4344-9542-286e3f8b9d5e','0730a88cf7a7816de264239124f13be77d3bfa3e28b64b67eb572e827bb162a4','2026-11-12 00:45:10','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:45:10'),(8,1,'d97ca291-540b-49c6-8e51-cfe25d144547','e73345468d6a9c933c4ca47bd2ccb4ac93298ab496e91275ce446b5b7790d44a','2026-11-12 00:45:12','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:45:12'),(9,1,'b8e577b6-d5db-429c-8e5c-3c314637826d','c329fa8f19f68b80e5260ba2408ce06a6adef76730e0c512cb1a99345accac0e','2026-11-12 00:45:25','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:45:25'),(10,1,'cda8abff-b3a1-4c2a-83e0-8e6e089bacf7','9843bd8e9a4856f49b52e91f3860d85399f0996cb5d832eef259814d19d6bc5f','2026-11-12 00:47:47','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:47:47'),(11,1,'5d656f5d-f717-4cb1-adf3-0e83d5265fe3','6eeca702fbca1571a06afd0d8814466bbc9ef81cbb7786d4d2bbe5b49a75d149','2026-11-12 00:49:02','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 07:49:02'),(12,1,'7550d2c9-8a41-4947-b788-bdbb6c6a4612','b94672f19867edb5b0a4d13a1cf134e68f508cd91812f32e0349ce309e96a5d5','2026-11-12 01:01:01','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'logout_all','2026-11-05 08:01:01'),(13,1,'b0af8ad3-da07-4d9c-a324-f30d8973a633','14e72c9294fbcce18ee42b3869e400e48f9848ac16e6ec4ef6e9a255f9ae2151','2026-11-12 01:08:34','2026-11-05 08:09:51',14,'Reqable/3.2.23','::1','2026-11-05 08:09:51','reuse_detected','2026-11-05 08:08:34'),(14,1,'b0af8ad3-da07-4d9c-a324-f30d8973a633','4753aa494371a02b05c08cdb194ece8674f4373d56975420433677b925662595','2026-11-12 01:09:51','2026-11-05 08:14:51',NULL,'Reqable/3.2.23','::1',NULL,'reuse_detected','2026-11-05 08:09:51'),(15,1,'28c9ef59-9857-49c0-8477-41292f6d59a5','37ff21875e4d9ca28e7e9f23a392cf0cf2fdfa00e72875bec28f15fe2c8055f4','2026-11-12 01:38:38',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 08:38:38'),(16,1,'079f9bec-944e-41b6-9281-4b4858cfb9f8','2de6daab51d5e6d71645aff074e4904d87f01623ba17b4f654655dc2e879aea4','2026-11-12 01:49:05',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 08:49:05'),(17,1,'c4e87403-8a7a-42a4-9962-66e53fb8835a','cd028fef87da16b5159f4c84aaced19778e8dd0c280c493bd1cf6446b4731651','2026-11-12 02:06:29',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 09:06:29'),(18,1,'93a69ffd-3452-41a3-92fe-6dbc9af4d3b1','d14216c4a0e05f0cc492eafb13803a81a0c68c213e4db6f3d576293402aa3173','2026-11-12 02:24:02',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 09:24:02'),(19,1,'09b35e06-cfbb-40e3-9dd1-56654c086b6b','822a9d6aff91d8e87af7deed7b2a79e67f0322fcd192890fe284b246a7d4f203','2026-11-12 07:21:17',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 14:21:17'),(20,1,'81c67b40-39c2-4ad5-8b9e-905749c68ce1','8a4c9d265af61cecb812e7b0a3d327b7cb1f2d3716b2f9b0b4189842597235f6','2026-11-12 07:39:08',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 14:39:08'),(21,3,'687c7c4c-ba44-40e4-a97c-7a10e48fd2ea','b6215f985d93de17c6e3c9bc4d3d0b58cb6a43a6358816310b575f71de324fb1','2026-11-12 07:40:44',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 14:40:44'),(22,3,'c992c4ca-2771-45ea-984c-0100f32f2b38','1139703f0e2b85aedb29040fd1c36d43f6670cebe41c61b9adb13ee4d55d75d5','2026-11-12 07:43:42','2026-11-05 18:49:21',23,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 18:49:21','rotated','2026-11-05 14:43:42'),(23,3,'c992c4ca-2771-45ea-984c-0100f32f2b38','d422c13d11dfb6dd5f3e2ec34984fc669f231664c07120147c4733ae64e154d0','2026-11-12 11:49:21',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 18:49:21'),(24,1,'817a081c-ee9a-4808-bf8e-e7197410cd82','c4077d067794d08c5f3856c40e839572f8d088521faf55461b9e1c9b70c4805b','2026-11-12 11:53:54','2026-11-05 19:15:22',25,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 19:15:22','rotated','2026-11-05 18:53:54'),(25,1,'817a081c-ee9a-4808-bf8e-e7197410cd82','a355d47406cf470969a50bc9accad6b1cf0a0ab1a7633fb16389633fdec7e4af','2026-11-12 12:15:22','2026-11-05 20:51:13',26,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 20:51:13','rotated','2026-11-05 19:15:22'),(26,1,'817a081c-ee9a-4808-bf8e-e7197410cd82','6bf83ed50a98dcf891576f4697cf99d48957a5408cf537521a6e356572e45033','2026-11-12 13:51:13','2026-11-05 20:51:16',27,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 20:51:16','rotated','2026-11-05 20:51:13'),(27,1,'817a081c-ee9a-4808-bf8e-e7197410cd82','7bfa6cd9bccda9353b33ce9511950ab29ac3752db70530272c74092030bd6b68','2026-11-12 13:51:16',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 20:51:16'),(28,1,'b12c7701-43d1-4259-9d61-01afe6814473','80871a07208a7973718e0b2e5b22ca7e3058f0958dfc15e6673192ac6a2abf33','2026-11-12 13:51:44',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 20:51:44'),(29,4,'7260cec1-c729-48d5-96c4-8160654a9a50','65f8e7aaa901cd3607bd67c5cd287fd6c7c6bc8a7175366f9f1eec72639c1429','2026-11-12 13:52:33',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 20:52:33'),(30,3,'1a6f8226-c870-437c-9909-4e568ffb145f','682c982c8df384175138ecbb328675c0a721277582053fb0e5eab18d9afe3057','2026-11-12 13:53:19',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 20:53:19'),(31,1,'d10f9077-6d4c-42fb-905a-696b8785a691','c0ca02900cee1216dc25e615340a9557870a9c08569e47039de248637455b4bb','2026-11-12 13:54:06',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 20:54:06'),(32,1,'29dcc9fb-ecc6-425d-b8a7-a4eaf420e2dd','eba6744184cd0ba4071924a525d8851304ca878a65048587a18f5f3a12eb6c49','2026-11-12 14:09:35',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:09:35'),(33,3,'bed1888e-3a3d-4c91-9c87-36229f0d02b1','300cfb0cbdde3c324f9763fd31eaaa8bd84c7c11bed9056791bb096788005b49','2026-11-12 14:09:57',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:09:57'),(34,4,'aa6a28bb-d2e6-4501-8f28-821e68bd6080','8d7fd9721edb5638d5676c24660b589cbe88ad4d1426b636d7f6a2ea1bc5f278','2026-11-12 14:10:10',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:10:10'),(35,1,'2d463e6e-2e46-4e82-b012-b7beb75c5ee1','7af124923b35d0bd892f4c1b06fe88e947cf0f961bc6021a9360a12ddfc2f6cd','2026-11-12 14:13:42',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:13:42'),(36,1,'ec0b5f0d-55b7-492d-969c-1b758907a640','9de6741c04174779c811f2e8fb1dd8bd7d1219d7569eef7d5e433562f65fcb11','2026-11-12 14:14:37',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 21:14:37'),(37,1,'37c3e15a-ce23-43dd-b47e-f7bdcc05c124','566ff1356f64184a6db2450440b72b610d115c6a12359fc607e37d4070791f5d','2026-11-12 14:28:14',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:28:14'),(38,1,'6b8e987c-5ae2-4826-9d62-38a6028de549','240ee509c8d6c8b97cda21ed3ff3263576d1fc7d1facf6c6c7608fef1255708f','2026-11-12 14:29:30',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 21:29:30'),(39,1,'89a03bbd-60d3-497f-8527-ce74d581dd49','8e461fe4a561f001c7bfc8f65d16d16bef3cfcdf4aa74e002535967bc7aee8ed','2026-11-12 14:30:30','2026-11-05 21:31:21',40,'Reqable/3.2.23','::1','2026-11-05 21:31:21','rotated','2026-11-05 21:30:30'),(40,1,'89a03bbd-60d3-497f-8527-ce74d581dd49','ab14504feaef19fea7053a1d8c11b1485c9c375f4943b754c994113e5b1e2a89','2026-11-12 14:31:21',NULL,NULL,'Reqable/3.2.23','::1',NULL,NULL,'2026-11-05 21:31:21'),(41,1,'8e997c65-1e85-4835-83e2-1ee9c2107ca0','525da3c2353f975f616735153c5f8b379a36b9ea0444ccc7a6cc556a53549886','2026-11-12 14:35:04',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:35:04'),(42,1,'fef7bb12-587a-4785-9e11-ea08e4aeabd1','eb11a2a25e1f7549c21d44acd887cbd4985a5f22b55bac1744a1efc5ddc24070','2026-11-12 14:39:07',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:39:07'),(43,1,'7d5d3101-577f-4278-86bf-ee216eeef121','d2d94033a920b7271a85dcd41171b8450557866b4562ca9b07d5124de60d90c7','2026-11-12 14:39:52',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:39:52'),(44,1,'2662c973-5137-4066-976a-827efc0eb7c9','47b0d30a453550d24b3e9b27c271de0d61d419de38d4019fc797cb62b9405be7','2026-11-12 14:42:21',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:42:21'),(45,1,'7b3cfc79-7612-419b-9ca4-9e64725833e7','c62f0be1b3a6abb07d5f3cf8b95cc16e3a61f25bac1cb8713d1812504cda4a62','2026-11-12 14:44:14','2026-11-05 21:44:19',46,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:44:19','rotated','2026-11-05 21:44:14'),(46,1,'7b3cfc79-7612-419b-9ca4-9e64725833e7','badd072847be5b08a0aa050b293f8cbcd2f0544c3abbe86ef0c5daef5a3d92f6','2026-11-12 14:44:19',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-05 21:44:19'),(47,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','9fd29aeefed743aff57b6455d7f86e5bd3a011d2001944331969b4cd5c028d1a','2026-11-12 14:45:46','2026-11-05 21:45:50',48,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:45:50','rotated','2026-11-05 21:45:46'),(48,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','f21dae292b26e71f91c40ac6578ba73534c631a8503bd80202126119a3067b00','2026-11-12 14:45:50','2026-11-05 21:47:05',49,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:47:05','rotated','2026-11-05 21:45:50'),(49,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','dd4569c1438ce617e0328af5037ed2e9d0d24ad0a751f3598cf4fa1405f9bd72','2026-11-12 14:47:05','2026-11-05 21:47:32',50,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:47:32','rotated','2026-11-05 21:47:05'),(50,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','dc109e6dd77db0d3a8a4fa1aac579e7471dd4505c1cf1ab821983d30c5e09798','2026-11-12 14:47:32','2026-11-05 21:48:36',51,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:48:36','rotated','2026-11-05 21:47:32'),(51,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','fc41cf8890857310cd3358fa7c594c9c95f724952af9364024594d475a083be4','2026-11-12 14:48:36','2026-11-05 21:49:41',52,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:49:41','rotated','2026-11-05 21:48:36'),(52,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','deff6ab8d578761d5370597cb5d1563d3f0c3accb0999c0e6445ce7f5a3115f7','2026-11-12 14:49:41','2026-11-05 21:50:24',53,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:50:24','rotated','2026-11-05 21:49:41'),(53,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','4056b21d24c867eae29f50032526cada59e3806f1a0377937aad1f9c4358996a','2026-11-12 14:50:24','2026-11-05 21:51:49',54,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:51:49','rotated','2026-11-05 21:50:24'),(54,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','95f89c81284f1afd53b70505f4f44327977d22dae6adf83deafa2139f5b8f5f4','2026-11-12 14:51:49','2026-11-05 21:52:31',55,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:52:31','rotated','2026-11-05 21:51:49'),(55,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','e7702004818bbc9ac1c07f86db2f9226f9794833c7252e00e85d576bae2524f5','2026-11-12 14:52:31','2026-11-05 21:54:02',56,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:54:02','rotated','2026-11-05 21:52:31'),(56,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','f62283f0e4e8bbc4a231fdb4afd3734ac8ac800adcd7fb3d4b004aa41c085db7','2026-11-12 14:54:02','2026-11-05 21:54:17',57,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:54:17','rotated','2026-11-05 21:54:02'),(57,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','ddaf59973afa90bb77a17878a6975d70c63879eb0ef2e97f715625bdd8014c2f','2026-11-12 14:54:17','2026-11-05 21:54:23',58,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:54:23','rotated','2026-11-05 21:54:17'),(58,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','c4968d08c80541e63c30546118a841c213c87b6a8cada9add0f909deb1c4933c','2026-11-12 14:54:23','2026-11-05 21:56:40',59,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:56:40','rotated','2026-11-05 21:54:23'),(59,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','3562304ecbbac60d249a5d9a269b084c43f8bc9b08b45a7c697d9f7918068f14','2026-11-12 14:56:40','2026-11-05 21:56:46',60,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:56:46','rotated','2026-11-05 21:56:40'),(60,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','b84ee3f7a79a165854dbcf47ea4a45b7eac8bb4eb1f055e42ec897da053c1bbd','2026-11-12 14:56:46','2026-11-05 21:58:18',61,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:58:18','rotated','2026-11-05 21:56:46'),(61,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','e60dcb0b3747ac302420beb712b251c047ef83dbdfba79e8420856154cb53c43','2026-11-12 14:58:18','2026-11-05 21:59:01',62,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:59:01','rotated','2026-11-05 21:58:18'),(62,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','88f401f22e9a9af7733b037cf69314b98c91aabbaf3fc91efca51e5722e25f74','2026-11-12 14:59:01','2026-11-05 21:59:17',63,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 21:59:17','rotated','2026-11-05 21:59:01'),(63,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','066aaa67234ae4cdbbd1b6c04405b892db1c1c7b0340c507d25dacf2693db373','2026-11-12 14:59:17','2026-11-05 22:00:30',64,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:00:30','rotated','2026-11-05 21:59:17'),(64,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','1fb92c9278633dbacdd3d3be8571bd7d36cf0cf8115538bfc011d43d581dcd0b','2026-11-12 15:00:30','2026-11-05 22:01:03',65,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:01:03','rotated','2026-11-05 22:00:30'),(65,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','6bfea51c68bfe27d9a24d77702fb182eedb98df9d2d2c368bd150ce72c064a4d','2026-11-12 15:01:03','2026-11-05 22:01:39',66,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:01:39','rotated','2026-11-05 22:01:03'),(66,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','fcedace0ebc449cb9ae76e4281259f93110fb83bd5b2c5239e6b58456a626952','2026-11-12 15:01:39','2026-11-05 22:02:30',67,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:02:30','rotated','2026-11-05 22:01:39'),(67,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','58cf64e9af51dfc34702ff45df5a68f0d039aa1af9cad247284d0f4c3e4f0e0c','2026-11-12 15:02:30','2026-11-05 22:02:48',68,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:02:48','rotated','2026-11-05 22:02:30'),(68,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','d66604690005b0cf5e0bf4ab268dba1c6fef9b70d29cda1c88800d91f509ecd2','2026-11-12 15:02:48','2026-11-05 22:03:28',69,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:03:28','rotated','2026-11-05 22:02:48'),(69,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','cd45c19264b9cd8f664dda86a20b312e8b459c160da054abbb8e8ce98b324e46','2026-11-12 15:03:28','2026-11-05 22:03:33',70,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:03:33','rotated','2026-11-05 22:03:28'),(70,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','068162868a8d338719b81c463af091490cb6198cdb403f68eb58f238d110eb82','2026-11-12 15:03:33','2026-11-05 22:03:38',71,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:03:38','rotated','2026-11-05 22:03:33'),(71,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','71dca9448761c3b81dd4902feb100cb50a6c615a5e86e20d4255e6336dcf7ccd','2026-11-12 15:03:38','2026-11-05 22:04:02',72,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:04:02','rotated','2026-11-05 22:03:38'),(72,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','bd5336a3dbdbd9adec3cb3a90fc20e80a6c3c765032e37536bfb95958bfd4e34','2026-11-12 15:04:02','2026-11-05 22:04:19',73,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:04:19','rotated','2026-11-05 22:04:02'),(73,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','787d6af2fda1ab074a211c2d421ec7420e9b588e66d254bce4ed4c39b8c29285','2026-11-12 15:04:19','2026-11-05 22:04:25',74,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:04:25','rotated','2026-11-05 22:04:19'),(74,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','aa6f2bf5af395382e2eabe52c0e9d582fff510052a2c9c2e1523e0413ed4fc0b','2026-11-12 15:04:25','2026-11-05 22:04:29',75,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:04:29','rotated','2026-11-05 22:04:25'),(75,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','717ae0efd80aa22196f391eb72365f87fe7f12c9e9649b1c2a43ca958d30213e','2026-11-12 15:04:29','2026-11-05 22:04:59',76,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:04:59','rotated','2026-11-05 22:04:29'),(76,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','63251a8e3b9c89bbb8ff9bad85fd607e16b5ee58945a0552bf74900d4bbbebb4','2026-11-12 15:04:59','2026-11-05 22:05:02',77,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:05:02','rotated','2026-11-05 22:04:59'),(77,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','4099ebd85af278e0b464030f185918d4e8ab068f1573671eecd06599b0fffd45','2026-11-12 15:05:02','2026-11-05 22:05:37',78,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:05:37','rotated','2026-11-05 22:05:02'),(78,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','ce4786cce3ca601b19189d2389806375b24ca9c3e721ed9acd3396cc0b45312a','2026-11-12 15:05:37','2026-11-05 22:08:25',79,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:08:25','rotated','2026-11-05 22:05:37'),(79,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','0e9f8b3f3e4c5c1322576e436cb541237e0354faf2c010860fc2401b9c7945df','2026-11-12 15:08:25','2026-11-05 22:09:16',80,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:09:16','rotated','2026-11-05 22:08:25'),(80,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','608392fa049003d5dc02d1a19c4d8a35cf0204ab5cd50821011df8b884e84daf','2026-11-12 15:09:16','2026-11-05 22:09:27',81,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:09:27','rotated','2026-11-05 22:09:16'),(81,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','42fea40d77ffd5cb45c797bffbcab0cd3612f8ed3cd20b3587a3c1c3fb72b940','2026-11-12 15:09:27','2026-11-05 22:10:16',82,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:10:16','rotated','2026-11-05 22:09:27'),(82,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','b62ef6ab0ea9ea4e436443c0fc46d5862f4dcacc57a4eb671b34cc483fb142eb','2026-11-12 15:10:16','2026-11-05 22:11:03',83,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:11:03','rotated','2026-11-05 22:10:16'),(83,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','c762e4c2b31aa0315d40ac5b94c1d0acb82d43f4bc02f1c0d6e067a338eb74ba','2026-11-12 15:11:03','2026-11-05 22:12:32',84,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:12:32','rotated','2026-11-05 22:11:03'),(84,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','81d86c6fdbe521b1710db0dc38025bf15ab24d9c3cc03c40d0032ad6563ab53e','2026-11-12 15:12:32','2026-11-05 22:13:26',85,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:13:26','rotated','2026-11-05 22:12:32'),(85,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','3d32e10b2b683ff8919a06ee3cea1076e6b2c49849f1bafa529f9eeb58728a7c','2026-11-12 15:13:26','2026-11-05 22:14:31',86,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:14:31','rotated','2026-11-05 22:13:26'),(86,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','ba3ff6286e5113b58d1fd4ac7b19296ef92d3bc8f50763099eeec79d068874fb','2026-11-12 15:14:31','2026-11-05 22:14:39',87,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:14:39','rotated','2026-11-05 22:14:31'),(87,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','ac288f74e6ca41febd179081529ac07daa22105157df61032e37d5277e509b30','2026-11-12 15:14:39','2026-11-05 22:15:08',88,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:15:08','rotated','2026-11-05 22:14:39'),(88,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','da849d05512f8b0a29d78dd4a0688fedb90edee5f86ecada73a5a62840c2224c','2026-11-12 15:15:08','2026-11-05 22:15:27',89,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:15:27','rotated','2026-11-05 22:15:08'),(89,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','5cb8a6b72e81c7a0ae2d8c581d0a9a807773d238a7d232f8d07578bf3ac5f628','2026-11-12 15:15:27','2026-11-05 22:31:48',90,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-05 22:31:48','rotated','2026-11-05 22:15:27'),(90,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','22609083ed6dcc2c552fcafdbc79b78b1d0f6dcb45f724c0432f473b75c7b21b','2026-11-12 15:31:48','2026-11-06 07:37:40',91,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:37:40','rotated','2026-11-05 22:31:48'),(91,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','3996e1d6c2267216d76807a0795ebfea1d5e51820dd1501b6bb0af48b70030bf','2026-11-13 00:37:40','2026-11-06 07:37:43',92,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:37:43','rotated','2026-11-06 07:37:40'),(92,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','acd329724d4fd4425c06f0fc7f1afd15597ac7f46811010fb6ee3e0e9ebcce25','2026-11-13 00:37:43','2026-11-06 07:38:56',93,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:38:56','rotated','2026-11-06 07:37:43'),(93,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','6ba9188f70374c100293215091444f1b553b25a39290902fdc46ae489fbaacd3','2026-11-13 00:38:56','2026-11-06 07:39:08',94,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:39:08','rotated','2026-11-06 07:38:56'),(94,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','0b0ee89bf8c7f039021b795649a6e5868928dd9bc53adf2243c3e8aacbafbbb2','2026-11-13 00:39:08','2026-11-06 07:42:17',95,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:42:17','rotated','2026-11-06 07:39:08'),(95,1,'9f4a429c-b596-44b5-9c16-d7945dc70527','b08d800e0be34db1677b7819d3938ff7b05e8c256b6a89ad0e6d1626551ac5db','2026-11-13 00:42:17','2026-11-06 07:42:22',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,'logout','2026-11-06 07:42:17'),(96,1,'8a2fe599-83ef-4959-b507-b98dc5c09cc6','075cbaedd72e4636cd924ff2066ef1abc1233863a2a6070f5c4998ab3df881e3','2026-11-13 00:42:49','2026-11-06 07:43:18',97,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 07:43:18','rotated','2026-11-06 07:42:49'),(97,1,'8a2fe599-83ef-4959-b507-b98dc5c09cc6','452cc6f019eb01eaad54978fa01b08ecf638cf31b9f4013f35ca94667859a2d4','2026-11-13 00:43:18','2026-11-06 07:43:26',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,'logout','2026-11-06 07:43:18'),(98,1,'6c7fdc50-a037-4dbf-82d9-e620fb059f72','eb566a3a10dba83f06970359c865ec32aed6770634edbc7b4b9cd0f164666adb','2026-11-13 00:43:57','2026-11-06 08:00:33',99,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:00:33','rotated','2026-11-06 07:43:57'),(99,1,'6c7fdc50-a037-4dbf-82d9-e620fb059f72','6ce7df216c298588aeedc8b14f1b9b9c29dfce3d060fd110fcae62bed63850bf','2026-11-13 01:00:33','2026-11-06 08:01:30',100,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:01:30','rotated','2026-11-06 08:00:33'),(100,1,'6c7fdc50-a037-4dbf-82d9-e620fb059f72','25c5eb5b82d9938908d31dcbb39a9a8926312a5e0eb5f3ec796a9210d1e183a3','2026-11-13 01:01:30','2026-11-06 08:03:27',101,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:03:27','rotated','2026-11-06 08:01:30'),(101,1,'6c7fdc50-a037-4dbf-82d9-e620fb059f72','67fa345b0c2c07d1716107e82636f196b83f9a3c51dcf360aafd4b79345b8050','2026-11-13 01:03:27','2026-11-06 08:04:31',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,'logout','2026-11-06 08:03:27'),(102,4,'9112a91f-cbdd-4e99-94d3-517c43853a91','92644c5f738ccad6b5da72f9015dc4c1534a3c0de7f79f9f310c51ee61d51c96','2026-11-13 01:05:40','2026-11-06 08:06:20',103,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:06:20','rotated','2026-11-06 08:05:40'),(103,4,'9112a91f-cbdd-4e99-94d3-517c43853a91','e2c5baeaaa5f81fd0f8e805d106dce62a84c63874a76c894129f4d5f984ed47c','2026-11-13 01:06:20','2026-11-06 08:09:12',104,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:09:12','rotated','2026-11-06 08:06:20'),(104,4,'9112a91f-cbdd-4e99-94d3-517c43853a91','f65db3300e7b09f3b3437c64586da0f712a8454fc299a77a2a7ad2ebc65572c2','2026-11-13 01:09:12','2026-11-06 08:14:14',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,'logout','2026-11-06 08:09:12'),(105,5,'d0c189ac-b9e9-4193-aa6d-c34cb2e14ea6','70175aba86d46401c3ff68d47db012395366657de3b2c9b35baf9e285df42d1d','2026-11-13 01:14:30','2026-11-06 08:16:03',106,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1','2026-11-06 08:16:03','rotated','2026-11-06 08:14:30'),(106,5,'d0c189ac-b9e9-4193-aa6d-c34cb2e14ea6','27c84c7ab570c48e838ea874169528b2d5c942e59c595b08df2afa7e9a27fac3','2026-11-13 01:16:03',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','::1',NULL,NULL,'2026-11-06 08:16:03');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(4,1),(1,2),(4,2),(1,3),(4,3),(1,4),(1,5),(2,5),(3,5),(4,5),(1,6),(2,6),(4,6),(1,7),(2,7),(4,7),(1,8),(4,8),(1,9),(2,9),(3,9),(4,9),(1,10),(2,10),(1,11),(2,11),(1,12),(2,12),(1,13),(2,13),(1,14),(2,14),(3,14),(4,14),(1,15),(2,15),(4,15),(1,16),(2,16),(4,16),(1,17),(3,17),(1,18),(2,18),(3,18),(4,18),(1,19),(2,19),(4,19),(1,20),(2,20),(4,20),(1,21),(2,21),(4,21),(1,23),(1,25),(2,25),(1,32),(2,32),(1,34),(2,34),(1,37);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Quản trị viên','Quản trị viên hệ thống','2026-11-04 13:47:23'),(2,'teacher','Giáo viên','Giáo viên','2026-11-04 13:47:23'),(3,'student','Học sinh','Học sinh','2026-11-04 13:47:23'),(4,'school_admin','School Administrator','Quản trị viên trường học','2026-11-04 13:47:23');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_participants`
--

DROP TABLE IF EXISTS `room_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_participants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `last_seen_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_user_active` (`session_id`,`user_id`,`joined_at`),
  KEY `idx_participant_user` (`user_id`),
  CONSTRAINT `fk_participant_session` FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_participants`
--

LOCK TABLES `room_participants` WRITE;
/*!40000 ALTER TABLE `room_participants` DISABLE KEYS */;
INSERT INTO `room_participants` VALUES (1,2,1,'2026-11-06 01:03:20','2026-11-06 01:03:26','2026-11-06 01:03:20'),(3,2,1,'2026-11-06 01:03:28','2026-11-06 01:06:19','2026-11-06 01:03:28'),(5,2,5,'2026-11-06 01:15:31','2026-11-06 01:16:02','2026-11-06 01:15:31'),(7,2,5,'2026-11-06 01:16:03','2026-11-06 01:26:58','2026-11-06 01:16:03');
/*!40000 ALTER TABLE `room_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_members`
--

DROP TABLE IF EXISTS `school_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_members` (
  `school_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `member_role` enum('admin','teacher','student') COLLATE utf8mb4_unicode_ci NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`school_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `school_members_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `school_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_members`
--

LOCK TABLES `school_members` WRITE;
/*!40000 ALTER TABLE `school_members` DISABLE KEYS */;
INSERT INTO `school_members` VALUES (1,1,'admin','2026-11-04 13:52:56'),(1,2,'teacher','2026-11-04 13:52:56'),(1,3,'student','2026-11-04 13:52:56');
/*!40000 ALTER TABLE `school_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `schools_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'THPT Kim Đồng','Ha Noi, Viet Nam',1,'2026-11-04 13:52:56');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `respondent_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `respondent_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempt_number` int DEFAULT '1',
  `started_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `status` enum('in_progress','submitted','auto_submitted','graded') COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `total_score` decimal(10,2) DEFAULT '0.00',
  `max_score` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_submissions_session` (`session_id`),
  KEY `idx_submissions_user` (`user_id`),
  KEY `idx_submissions_status` (`status`),
  KEY `idx_submission_session` (`session_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`id`),
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,2,1,NULL,NULL,1,'2026-11-05 08:51:04','2026-11-05 08:53:28','submitted',6.00,2.50,'2026-11-05 01:51:04'),(2,1,5,NULL,NULL,1,'2026-10-26 11:24:14','2026-10-26 11:24:14','graded',8.00,8.00,'2026-11-05 11:24:14'),(3,1,6,NULL,NULL,1,'2026-10-26 11:24:14','2026-10-26 11:24:14','graded',4.00,8.00,'2026-11-05 11:24:14'),(4,1,7,NULL,NULL,1,'2026-10-26 11:24:14','2026-10-26 11:24:14','graded',7.00,8.00,'2026-11-05 11:24:14'),(5,1,8,NULL,NULL,1,'2026-10-26 11:24:14','2026-10-26 11:24:14','graded',5.00,8.00,'2026-11-05 11:24:14'),(6,2,5,NULL,NULL,1,'2026-11-06 08:15:31','2026-11-06 08:16:31','submitted',0.00,10.00,'2026-11-06 01:15:31');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,'2026-11-04 13:51:36'),(2,2,'2026-11-05 01:00:02'),(3,2,'2026-11-05 11:22:36'),(3,3,'2026-11-04 13:51:36'),(4,2,'2026-11-04 15:30:14'),(4,3,'2026-11-05 11:22:36'),(5,3,'2026-11-05 11:22:36'),(6,3,'2026-11-05 11:22:36'),(7,3,'2026-11-05 11:22:36'),(8,3,'2026-11-05 11:22:36');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','locked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','$2a$10$.vYzTLnPjZ4X5mwZHdwgUO12cWHRk9lbqcmE2SmSnv9471uuFGBvG','Nguyễn Văn Quản Trị',NULL,NULL,'active','2026-11-04 13:51:12','2026-11-05 11:22:36'),(2,'teacher01','newemail@example.com','$2a$10$.vYzTLnPjZ4X5mwZHdwgUO12cWHRk9lbqcmE2SmSnv9471uuFGBvG','Trần Thị Nguyện',NULL,NULL,'inactive','2026-11-04 13:51:12','2026-11-05 11:22:36'),(3,'student01','student@example.com','$2a$10$.vYzTLnPjZ4X5mwZHdwgUO12cWHRk9lbqcmE2SmSnv9471uuFGBvG','Lê Văn Hùng',NULL,NULL,'active','2026-11-04 13:51:12','2026-11-05 11:22:36'),(4,'teacher02','user@gmail.com','$2a$10$.vYzTLnPjZ4X5mwZHdwgUO12cWHRk9lbqcmE2SmSnv9471uuFGBvG','Phạm Hoàng An',NULL,NULL,'active','2026-11-04 15:30:14','2026-11-05 13:52:31'),(5,'hs.bao','bao@student.edu.vn','$2b$10$P.JU1rlTNeE4c0ZWIdKRruM6GCaN8kM6gCj/0IjMgN.5x3072JwJK','Đỗ Minh Bảo',NULL,NULL,'active','2026-11-05 11:22:36','2026-11-05 11:22:36'),(6,'hs.chau','chau@student.edu.vn','$2b$10$P.JU1rlTNeE4c0ZWIdKRruM6GCaN8kM6gCj/0IjMgN.5x3072JwJK','Vũ Hải Châu',NULL,NULL,'active','2026-11-05 11:22:36','2026-11-05 11:22:36'),(7,'hs.dung','dung@student.edu.vn','$2b$10$P.JU1rlTNeE4c0ZWIdKRruM6GCaN8kM6gCj/0IjMgN.5x3072JwJK','Ngô Thùy Dung',NULL,NULL,'active','2026-11-05 11:22:36','2026-11-05 11:22:36'),(8,'hs.em','em@student.edu.vn','$2b$10$P.JU1rlTNeE4c0ZWIdKRruM6GCaN8kM6gCj/0IjMgN.5x3072JwJK','Bùi Quốc Em',NULL,NULL,'active','2026-11-05 11:22:36','2026-11-05 11:22:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'online_education_platform'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-07 13:09:58
