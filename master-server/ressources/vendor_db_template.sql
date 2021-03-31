-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.20 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table restopos.actions
CREATE TABLE IF NOT EXISTS `actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_added` int NOT NULL,
  `reversed` int NOT NULL DEFAULT '0',
  `ax_associated` int NOT NULL DEFAULT '0',
  `ax_group` int NOT NULL DEFAULT '0',
  `ax_type` int NOT NULL DEFAULT '0',
  `ref1` int NOT NULL DEFAULT '0',
  `ref2` int NOT NULL DEFAULT '0',
  `ref3` int NOT NULL DEFAULT '0',
  `s1` int NOT NULL DEFAULT '0',
  `s2` int NOT NULL DEFAULT '0',
  `s3` int NOT NULL DEFAULT '0',
  `data` text,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `no` varchar(20) NOT NULL,
  `date` varchar(10) NOT NULL,
  `time` varchar(5) NOT NULL,
  `number_of_persons` int NOT NULL DEFAULT '0',
  `category` enum('breakfast','lunch','dinner') NOT NULL,
  `status` enum('booked','canceled') NOT NULL,
  `customer_name` varchar(50) NOT NULL DEFAULT '',
  `customer_phone` varchar(50) NOT NULL DEFAULT '',
  `comment` varchar(255) NOT NULL DEFAULT '',
  `client_id` int NOT NULL DEFAULT '0',
  `updated_at` int NOT NULL,
  `created_at` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `no` (`no`),
  KEY `datetime` (`date`,`time`),
  KEY `client` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.booking_slots
CREATE TABLE IF NOT EXISTS `booking_slots` (
  `day` varchar(10) NOT NULL,
  `time_slots` json NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT '0',
  `childs_type` int NOT NULL DEFAULT '0',
  `sort_no` int NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `ctype` int NOT NULL,
  `date_modified` int DEFAULT '0',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_company` int NOT NULL DEFAULT '0',
  `phone` varchar(15) NOT NULL,
  `email` varchar(40) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `want_receipt` int NOT NULL DEFAULT '0',
  `date_added` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `amount` int NOT NULL,
  `order_id` int NOT NULL,
  `is_paid` int NOT NULL DEFAULT '0',
  `date_added` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.loyalty_cards
CREATE TABLE IF NOT EXISTS `loyalty_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(20) NOT NULL,
  `client_id` int NOT NULL,
  `balance` int NOT NULL DEFAULT '0',
  `date_added` int NOT NULL,
  `date_modified` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.offers
CREATE TABLE IF NOT EXISTS `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '0',
  `expires` varchar(30) DEFAULT NULL,
  `condition` json NOT NULL,
  `available_on_delivery` tinyint NOT NULL DEFAULT '0',
  `available_on_pickup` tinyint NOT NULL DEFAULT '0',
  `available_on_website` tinyint NOT NULL DEFAULT '0',
  `available_on_pos` tinyint NOT NULL DEFAULT '0',
  `benefits` json NOT NULL,
  `activated_by_promo_code` tinyint NOT NULL DEFAULT '0',
  `promo_code` varchar(50) NOT NULL DEFAULT '0',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `no` varchar(50) NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `user_id` int NOT NULL,
  `client_id` int NOT NULL,
  `order_type` varchar(50) NOT NULL,
  `order_details` varchar(300) NOT NULL,
  `total` int NOT NULL,
  `pay_method` varchar(20) NOT NULL,
  `totals` varchar(400) NOT NULL,
  `items` text NOT NULL,
  `other_data` varchar(1000) DEFAULT NULL,
  `receipt` int NOT NULL DEFAULT '0',
  `date_added` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.prepaid_cards
CREATE TABLE IF NOT EXISTS `prepaid_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `card_type` int NOT NULL DEFAULT '0',
  `barcode` varchar(20) NOT NULL,
  `client_id` int NOT NULL,
  `balance` int NOT NULL,
  `date_added` int NOT NULL,
  `date_modified` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `sort_no` int NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL,
  `price` int NOT NULL,
  `stock_enabled` int NOT NULL DEFAULT '0',
  `stock` int NOT NULL DEFAULT '-1',
  `can_exclude_taxes` int NOT NULL DEFAULT '0',
  `product_type` int NOT NULL,
  `contains_allergens` int NOT NULL DEFAULT '0',
  `date_modified` int NOT NULL DEFAULT '0',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `value` varchar(255) NOT NULL,
  `data_type` varchar(10) NOT NULL DEFAULT 'string',
  `modified_by_user_id` int NOT NULL,
  `modified_by_username` varchar(50) NOT NULL,
  `date_modified` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.stats
CREATE TABLE IF NOT EXISTS `stats` (
  `day` int NOT NULL,
  `date_added` int NOT NULL,
  `cw` int NOT NULL DEFAULT '0',
  `pp` int NOT NULL DEFAULT '0',
  `rpp` int NOT NULL DEFAULT '0',
  `dt` int NOT NULL DEFAULT '0',
  `cs` int DEFAULT '0',
  `cc` int DEFAULT '0',
  `cxc` int DEFAULT '0',
  `cxv` int DEFAULT '0',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `xtype` varchar(50) NOT NULL,
  `xamount` int NOT NULL,
  `ref_code` int NOT NULL,
  `client_id` int NOT NULL,
  `date_added` int NOT NULL,
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_type` int NOT NULL,
  `username` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `date_added` int NOT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.user_tokens
CREATE TABLE IF NOT EXISTS `user_tokens` (
  `user_id` int NOT NULL,
  `token` varchar(30) NOT NULL,
  `date_added` int NOT NULL,
  `is_active` int NOT NULL DEFAULT '0',
  `__is_deleted` int DEFAULT NULL,
  `__deleted_time` int DEFAULT NULL,
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table restopos.__sqlsyncer_tables
CREATE TABLE IF NOT EXISTS `__sqlsyncer_tables` (
  `name` varchar(255) DEFAULT NULL,
  `last_id` int DEFAULT NULL,
  `last_update_time` int DEFAULT NULL,
  UNIQUE KEY `__sqlsyncer_tables_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
