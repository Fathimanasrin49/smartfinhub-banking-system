-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_finhub
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(50) DEFAULT 'super_admin',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'superadmin@smartfinhub.com','admin123','Super Admin','super_admin','active','2026-02-18 07:47:31');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_requests`
--

DROP TABLE IF EXISTS `approval_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('deposit','withdraw','kyc_update') NOT NULL,
  `customer_id` int NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `resolved_by` int DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `approval_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approval_requests_ibfk_2` FOREIGN KEY (`resolved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_requests`
--

LOCK TABLES `approval_requests` WRITE;
/*!40000 ALTER TABLE `approval_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text,
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'update_customer','customer',5,'{\"status\":\"active\",\"kycStatus\":\"verified\"}','::1','2026-03-25 06:14:28');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch_tokens`
--

DROP TABLE IF EXISTS `branch_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `token_number` varchar(20) NOT NULL,
  `branch_id` int NOT NULL,
  `status` enum('waiting','served','cancelled') DEFAULT 'waiting',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `branch_id` (`branch_id`),
  KEY `idx_token_status` (`status`),
  KEY `idx_token_date` (`created_at`),
  CONSTRAINT `branch_tokens_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `branch_tokens_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch_tokens`
--

LOCK TABLES `branch_tokens` WRITE;
/*!40000 ALTER TABLE `branch_tokens` DISABLE KEYS */;
INSERT INTO `branch_tokens` VALUES (1,4,'TKN-0001',1,'waiting','2026-03-25 05:59:03'),(2,5,'TKN-0001',2,'cancelled','2026-03-25 06:07:02'),(3,5,'TKN-0002',1,'waiting','2026-03-25 06:07:57');
/*!40000 ALTER TABLE `branch_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` text,
  `city` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'Smart FinHub Main Branch','123 Finance Street','Mumbai','022-12345678','2026-02-18 07:47:31'),(2,'Smart FinHub East Branch','456 Banking Avenue','Delhi','011-87654321','2026-02-18 07:47:31');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_number` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text,
  `photo` longtext,
  `kyc_proof` longtext,
  `password` varchar(255) DEFAULT NULL,
  `face_data` longtext,
  `balance` decimal(15,2) DEFAULT '0.00',
  `kyc_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `status` enum('active','inactive','blocked') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'ACC001234','Rahul Sharma','rahul@example.com','9876543210',NULL,NULL,NULL,'demo123',NULL,50000.00,'verified','active','2026-02-18 07:47:31','2026-02-18 07:47:31'),(2,'ACC005678','Priya Patel','priya@example.com','9123456789',NULL,NULL,NULL,'demo123',NULL,75000.00,'verified','active','2026-02-18 07:47:31','2026-02-18 07:47:31'),(3,'ACC03284889','test','test@gmail.com','7539518520','test address','/uploads/photos/1771403284827-1akyjlw.webp','/uploads/kyc/1771403284823-6o646bt.pdf','Test@123',NULL,1200.00,'rejected','active','2026-02-18 08:28:04','2026-02-22 14:35:52'),(4,'ACC00686001','Naazim','mohdnaazim252@gmail.com','9847747050','North Paravur, Ernakulam','/uploads/photos/1771700685923-knnumkz.webp','/uploads/kyc/1771700685917-93oail5.pdf','Naazim@123',NULL,600.00,'verified','active','2026-02-21 19:04:46','2026-02-22 14:28:30'),(5,'ACC18816182','Fathima Nasrin','nasrinf933@gmail.com','951753850','Aluva, Ernakulam','/uploads/photos/1774418816170-m2o7e7i.png','/uploads/kyc/1774418816167-0vfgdlx.pdf','Nasrin@123',NULL,0.00,'verified','active','2026-03-25 06:06:56','2026-03-25 06:14:28');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disputes`
--

DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disputes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `reason` text NOT NULL,
  `status` enum('open','resolved','rejected') DEFAULT 'open',
  `resolved_by` int DEFAULT NULL,
  `resolution_notes` text,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_status` (`status`),
  KEY `idx_customer` (`customer_id`),
  CONSTRAINT `disputes_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disputes_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `disputes_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputes`
--

LOCK TABLES `disputes` WRITE;
/*!40000 ALTER TABLE `disputes` DISABLE KEYS */;
/*!40000 ALTER TABLE `disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_permissions`
--

DROP TABLE IF EXISTS `employee_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `permission` varchar(100) NOT NULL,
  `granted` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_permissions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_permissions`
--

LOCK TABLES `employee_permissions` WRITE;
/*!40000 ALTER TABLE `employee_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `photo` longtext,
  `password` varchar(255) DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EMP000001','Admin User','admin@smartfinhub.com','9999999999','Branch Manager',NULL,'admin123',1,'Branch Manager','active','2026-02-18 07:47:31','2026-02-18 07:47:31'),(2,'EMP02032435','Aswin','aswin@gmail.com',NULL,'Branch Manager','/uploads/photos/1771702032427-sxh16uf.jpg','Aswin@123',NULL,NULL,'active','2026-02-21 19:27:12','2026-02-21 19:27:12');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `branch_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_branch` (`branch_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,4,1,4,'sadfgh','2026-03-23 08:32:07');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fraud_alerts`
--

DROP TABLE IF EXISTS `fraud_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fraud_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `risk_level` enum('low','medium','high','critical') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `transaction_id` (`transaction_id`),
  CONSTRAINT `fraud_alerts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fraud_alerts_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fraud_alerts`
--

LOCK TABLES `fraud_alerts` WRITE;
/*!40000 ALTER TABLE `fraud_alerts` DISABLE KEYS */;
INSERT INTO `fraud_alerts` VALUES (1,4,3,'high','Rapid fund movement: A large cash deposit was followed by a withdrawal and a significant transfer to an external account within 15 minutes, which is a common pattern for illicit activity.','2026-03-23 08:13:39'),(2,4,2,'medium','Immediate cash withdrawal: A withdrawal was processed 23 seconds after a cash deposit.','2026-03-23 08:13:39'),(3,4,3,'medium','Unusual description: The transaction uses a generic \'Sample Transfer\' description for a significant amount of 1200.00.','2026-03-23 08:13:39'),(4,4,2,'medium','Rapid succession detected: Cash withdrawal performed 23 seconds after a large cash deposit.','2026-03-23 08:13:47'),(5,4,3,'high','Significant outgoing transfer with a generic description (\'Sample Transfer\') initiated shortly after a large cash deposit.','2026-03-23 08:13:47');
/*!40000 ALTER TABLE `fraud_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `otps_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `branch_id` int DEFAULT NULL,
  `type` varchar(50) DEFAULT 'general',
  `subject` varchar(255) NOT NULL,
  `description` text,
  `status` enum('open','in_progress','resolved') DEFAULT 'open',
  `assigned_to` int DEFAULT NULL,
  `resolution_notes` text,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_status` (`status`),
  KEY `idx_branch` (`branch_id`),
  CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_requests_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `service_requests_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'max_transaction_limit','100000','2026-02-18 07:47:31'),(2,'fraud_alert_threshold','50000','2026-02-18 07:47:31'),(3,'session_timeout_minutes','30','2026-02-18 07:47:31'),(4,'require_otp_for_transfer','false','2026-02-18 07:47:31'),(5,'backup_enabled','true','2026-02-18 07:47:31');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(36) NOT NULL,
  `sender_account` varchar(20) DEFAULT NULL,
  `receiver_account` varchar(20) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `category` varchar(50) DEFAULT 'other',
  `description` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_sender` (`sender_account`),
  KEY `idx_receiver` (`receiver_account`),
  KEY `idx_transactions_customer` (`sender_account`,`receiver_account`),
  KEY `idx_transactions_date` (`created_at`),
  KEY `idx_transactions_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'TXN1771701299853-OJFSI7R',NULL,'ACC00686001',2000.00,'credit','other','Cash Deposit','completed','2026-02-21 19:14:59'),(2,'TXN1771701322330-BGAB4JC','ACC00686001',NULL,200.00,'debit','other','Cash Withdrawal','completed','2026-02-21 19:15:22'),(3,'TXN1771702141346-7DC6L1F','ACC00686001','ACC03284889',1200.00,'debit','transfer','Sample Transfer','completed','2026-02-21 19:29:01'),(4,'TXN1771702141346-7DC6L1F-CR','ACC00686001','ACC03284889',1200.00,'credit','transfer','Sample Transfer','completed','2026-02-21 19:29:01');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `notification_type` enum('low_balance','token_called','fraud_alert') NOT NULL,
  `reference_id` varchar(64) NOT NULL,
  `risk_level` varchar(20) DEFAULT NULL,
  `message` text,
  `ai_message` text,
  `is_read` tinyint DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_notification` (`customer_id`,`notification_type`,`reference_id`),
  KEY `idx_notifications_customer_created` (`customer_id`,`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 12:33:32
