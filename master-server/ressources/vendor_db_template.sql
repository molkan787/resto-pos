-- --------------------------------------------------------
-- Hôte :                        127.0.0.1
-- Version du serveur:           10.1.39-MariaDB - mariadb.org binary distribution
-- SE du serveur:                Win64
-- HeidiSQL Version:             10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Listage de la structure de la table restopos_template. actions
CREATE TABLE IF NOT EXISTS `actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_added` int(11) NOT NULL,
  `reversed` int(11) NOT NULL DEFAULT '0',
  `ax_associated` int(11) NOT NULL DEFAULT '0',
  `ax_group` int(11) NOT NULL DEFAULT '0',
  `ax_type` int(11) NOT NULL DEFAULT '0',
  `ref1` int(11) NOT NULL DEFAULT '0',
  `ref2` int(11) NOT NULL DEFAULT '0',
  `ref3` int(11) NOT NULL DEFAULT '0',
  `s1` int(11) NOT NULL DEFAULT '0',
  `s2` int(11) NOT NULL DEFAULT '0',
  `s3` int(11) NOT NULL DEFAULT '0',
  `data` text,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.actions : ~0 rows (environ)
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL DEFAULT '0',
  `childs_type` int(11) NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `ctype` int(11) NOT NULL,
  `date_modified` int(11) DEFAULT '0',
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.categories : ~0 rows (environ)
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_company` int(11) NOT NULL DEFAULT '0',
  `phone` varchar(15) NOT NULL,
  `email` varchar(40) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `want_receipt` int(11) NOT NULL DEFAULT '0',
  `date_added` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.clients : ~0 rows (environ)
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `is_paid` int(11) NOT NULL DEFAULT '0',
  `date_added` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.invoices : ~0 rows (environ)
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. loyalty_cards
CREATE TABLE IF NOT EXISTS `loyalty_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `barcode` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `balance` int(11) NOT NULL DEFAULT '0',
  `date_added` int(11) NOT NULL,
  `date_modified` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.loyalty_cards : ~0 rows (environ)
/*!40000 ALTER TABLE `loyalty_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_cards` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` int(11) NOT NULL DEFAULT '1',
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `order_type` varchar(50) NOT NULL,
  `order_details` varchar(300) NOT NULL,
  `total` int(11) NOT NULL,
  `pay_method` varchar(20) NOT NULL,
  `totals` varchar(400) NOT NULL,
  `items` text NOT NULL,
  `other_data` varchar(1000) DEFAULT NULL,
  `receipt` int(11) NOT NULL DEFAULT '0',
  `date_added` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.orders : ~0 rows (environ)
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. prepaid_cards
CREATE TABLE IF NOT EXISTS `prepaid_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_type` int(11) NOT NULL DEFAULT '0',
  `barcode` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  `date_added` int(11) NOT NULL,
  `date_modified` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.prepaid_cards : ~0 rows (environ)
/*!40000 ALTER TABLE `prepaid_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `prepaid_cards` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `can_exclude_taxes` int(11) NOT NULL DEFAULT '0',
  `product_type` int(11) NOT NULL,
  `date_modified` int(11) NOT NULL DEFAULT '0',
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.products : ~0 rows (environ)
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `value` varchar(255) NOT NULL,
  `data_type` varchar(10) NOT NULL DEFAULT 'string',
  `modified_by_user_id` int(11) NOT NULL,
  `modified_by_username` varchar(50) NOT NULL,
  `date_modified` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.settings : ~0 rows (environ)
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. stats
CREATE TABLE IF NOT EXISTS `stats` (
  `day` int(11) NOT NULL,
  `date_added` int(11) NOT NULL,
  `cw` int(11) NOT NULL DEFAULT '0',
  `pp` int(11) NOT NULL DEFAULT '0',
  `rpp` int(11) NOT NULL DEFAULT '0',
  `dt` int(11) NOT NULL DEFAULT '0',
  `cs` int(11) DEFAULT '0',
  `cc` int(11) DEFAULT '0',
  `cxc` int(11) DEFAULT '0',
  `cxv` int(11) DEFAULT '0',
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.stats : ~0 rows (environ)
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `xtype` varchar(50) NOT NULL,
  `xamount` int(11) NOT NULL,
  `ref_code` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `date_added` int(11) NOT NULL,
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.transactions : ~0 rows (environ)
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_type` int(11) NOT NULL,
  `username` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `date_added` int(11) NOT NULL,
  `is_active` int(11) NOT NULL DEFAULT '1',
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.users : ~0 rows (environ)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. user_tokens
CREATE TABLE IF NOT EXISTS `user_tokens` (
  `user_id` int(11) NOT NULL,
  `token` varchar(30) NOT NULL,
  `date_added` int(11) NOT NULL,
  `is_active` int(11) NOT NULL DEFAULT '0',
  `__is_deleted` int(2) DEFAULT NULL,
  `__deleted_time` int(11) DEFAULT NULL,
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.user_tokens : ~0 rows (environ)
/*!40000 ALTER TABLE `user_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_tokens` ENABLE KEYS */;

-- Listage de la structure de la table restopos_template. __sqlsyncer_tables
CREATE TABLE IF NOT EXISTS `__sqlsyncer_tables` (
  `name` varchar(255) DEFAULT NULL,
  `last_id` int(11) DEFAULT NULL,
  `last_update_time` int(11) DEFAULT NULL,
  UNIQUE KEY `__sqlsyncer_tables_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Listage des données de la table restopos_template.__sqlsyncer_tables : ~7 rows (environ)
/*!40000 ALTER TABLE `__sqlsyncer_tables` DISABLE KEYS */;
INSERT INTO `__sqlsyncer_tables` (`name`, `last_id`, `last_update_time`) VALUES
	('users', 1, 0),
	('categories', 0, 0),
	('products', 0, 0),
	('actions', 0, 0),
	('settings', 0, 0),
	('clients', 0, 0),
	('orders', 0, 0);
/*!40000 ALTER TABLE `__sqlsyncer_tables` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
