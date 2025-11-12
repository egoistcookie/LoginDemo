-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: login_demo
-- ------------------------------------------------------
-- Server version	8.0.44

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

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (6,0,'首页','home','HomeOutlined',1,'2025-10-31 22:09:57','2025-10-31 23:58:55','home','/home','',1),(7,0,'人员管理','users','UserAddOutlined',2,'2025-10-31 22:09:57','2025-10-31 22:36:56','users','/users',NULL,1),(8,0,'角色管理','roles','UserOutlined',3,'2025-10-31 22:09:57','2025-10-31 22:36:56','roles','/roles',NULL,1),(9,0,'菜单管理','menus','UnorderedListOutlined',4,'2025-10-31 22:09:57','2025-10-31 22:36:56','menus','/menus',NULL,1),(10,0,'未完待续','more','SettingOutlined',5,'2025-10-31 22:09:57','2025-10-31 22:36:56','more','/more',NULL,1),(11,6,'数据看板','home-dashboard',NULL,1,'2025-10-31 22:10:02','2025-10-31 22:43:40','home-dashboard','/home-dashboard',NULL,1),(12,6,'统计报表','home-stats',NULL,2,'2025-10-31 22:10:02','2025-10-31 22:43:40','home-stats','/home-stats',NULL,1),(13,6,'概览信息','home-overview',NULL,3,'2025-10-31 22:10:02','2025-10-31 22:43:40','home-overview','/home-overview',NULL,1),(14,7,'用户列表','users-list',NULL,1,'2025-10-31 22:10:02','2025-10-31 22:43:40','users-list','/users-list',NULL,1),(15,7,'添加用户','users-add','',2,'2025-10-31 22:10:02','2025-10-31 23:56:32','more-about','/users-add','',1),(16,7,'导入用户','users-import',NULL,3,'2025-10-31 22:10:02','2025-10-31 22:43:40','users-import','/users-import',NULL,1),(17,8,'角色列表','roles-list',NULL,1,'2025-10-31 22:10:02','2025-10-31 22:43:40','roles-list','/roles-list',NULL,1),(18,8,'创建角色','roles-add',NULL,2,'2025-10-31 22:10:02','2025-10-31 22:43:40','roles-add','/roles-add',NULL,1),(19,8,'权限配置','roles-permissions',NULL,3,'2025-10-31 22:10:02','2025-10-31 22:43:40','roles-permissions','/roles-permissions',NULL,1),(20,9,'菜单列表','menus-list',NULL,1,'2025-10-31 22:10:02','2025-10-31 22:43:40','menus-list','/menus-list',NULL,1),(21,9,'添加菜单','menus-add','',2,'2025-10-31 22:10:02','2025-10-31 23:54:23','menus-add','/menus-add','',1),(22,9,'排序设置','menus-sort',NULL,3,'2025-10-31 22:10:02','2025-10-31 22:43:40','menus-sort','/menus-sort',NULL,1),(23,10,'系统设置','more-settings',NULL,1,'2025-10-31 22:10:02','2025-10-31 22:43:40','more-settings','/more-settings',NULL,1),(24,10,'帮助文档','more-help',NULL,2,'2025-10-31 22:10:02','2025-10-31 22:43:40','more-help','/more-help',NULL,1),(25,10,'审计日志','audit-logs','FileSearchOutlined',3,'2025-10-31 22:10:02','2025-10-31 22:43:40','audit-logs','/audit-logs',NULL,1);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `role_menus`
--

LOCK TABLES `role_menus` WRITE;
/*!40000 ALTER TABLE `role_menus` DISABLE KEYS */;
INSERT INTO `role_menus` VALUES (85,1,6,'2025-10-31 23:36:04'),(86,1,11,'2025-10-31 23:36:04'),(87,1,12,'2025-10-31 23:36:04'),(88,1,13,'2025-10-31 23:36:04'),(89,1,7,'2025-10-31 23:36:04'),(90,1,14,'2025-10-31 23:36:04'),(91,3,6,'2025-10-31 23:46:48'),(92,3,7,'2025-10-31 23:46:48'),(93,3,8,'2025-10-31 23:46:48'),(94,3,9,'2025-10-31 23:46:48'),(95,3,11,'2025-10-31 23:46:48'),(96,3,12,'2025-10-31 23:46:48'),(97,3,13,'2025-10-31 23:46:48'),(98,3,14,'2025-10-31 23:46:48'),(99,3,15,'2025-10-31 23:46:48'),(100,3,16,'2025-10-31 23:46:48'),(101,3,17,'2025-10-31 23:46:48'),(102,3,18,'2025-10-31 23:46:48'),(103,3,19,'2025-10-31 23:46:48'),(104,3,20,'2025-10-31 23:46:48'),(105,3,21,'2025-10-31 23:46:48'),(106,3,22,'2025-10-31 23:46:48'),(107,3,23,'2025-10-31 23:46:48'),(108,3,24,'2025-10-31 23:46:48'),(109,3,25,'2025-10-31 23:46:48'),(110,3,10,'2025-10-31 23:46:48'),(123,2,6,'2025-10-31 23:49:10'),(124,2,7,'2025-10-31 23:49:10'),(125,2,11,'2025-10-31 23:49:10'),(126,2,12,'2025-10-31 23:49:10'),(127,2,13,'2025-10-31 23:49:10'),(128,2,14,'2025-10-31 23:49:10'),(129,2,15,'2025-10-31 23:49:10'),(130,2,16,'2025-10-31 23:49:10'),(131,2,9,'2025-10-31 23:49:10'),(132,2,20,'2025-10-31 23:49:10'),(133,2,21,'2025-10-31 23:49:10'),(134,2,22,'2025-10-31 23:49:10');
/*!40000 ALTER TABLE `role_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'USER','普通用户','2025-10-29 21:32:03'),(2,'ADMIN','管理员用户','2025-10-29 21:32:03'),(3,'SYSTEM','系统管理员，拥有最高级权限，可显示所有菜单','2025-10-31 21:36:06');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (5,1,2,'2025-10-31 21:37:45'),(10,11,2,'2025-10-31 23:08:39'),(11,12,1,'2025-10-31 23:08:45'),(13,14,1,'2025-10-31 23:08:59'),(14,16,3,'2025-10-31 23:09:03'),(17,10,3,'2025-10-31 23:46:37'),(18,13,1,'2025-10-31 23:47:59');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testuser','$2a$10$QwCw9J8Yv2X9yV1zR5z6.e3X2Y1W3E4R5T6Y7U8I9O0P1Q2R3S4T5','test@example.com','13800138000',1,'2025-10-29 21:32:03','2025-10-29 21:32:03'),(10,'1111','$2a$10$eWZDIjTHHAGwrSYGOaAMJeAuW2CKILJvBaScPlKponNMggWBaSASC','335985579@qq.com','19926811352',1,'2025-10-29 22:19:10','2025-10-29 22:19:10'),(11,'2222','$2a$10$VIzHz2qs1g/ggIdg/Q2gfuuZHEgklr.YU5olcXDyFmqSUrZx1Qehq','335981579@qq.com','13441526534',1,'2025-10-29 22:22:29','2025-10-30 22:39:40'),(12,'22222','$2a$10$FHhdKvp4hmCPcs6VGmvXlu5esrxyX4Y9segiYw/Hl1s84PZgZ57lK','135985579@qq.com','13441526583',1,'2025-10-29 22:33:42','2025-10-30 22:38:07'),(13,'3333','$2a$10$Rc5NraTa7FXeDByZlTlw9OoLmBfpvtaC8ee4dZ280iv7YgbYBjm7G','2368061425@qq.com','13441526584',1,'2025-10-30 22:24:28','2025-10-30 22:28:38'),(14,'4444','$2a$10$KhyNXph44cyo02jTQd.aWuMmbXACAx.STf1YdB6JIV7F9Ic7Dk5HS','2368061435@qq.com','13441526181',1,'2025-10-30 22:53:50','2025-10-30 22:53:50'),(16,'5555','$2a$10$ugpLSH9TdiYYuuWsGlsPauEb30dnaEz8hA7acuWJnDlX3rg29d002','2368061411@qq.com','',1,'2025-10-30 23:10:32','2025-10-30 23:10:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-01  0:03:01
