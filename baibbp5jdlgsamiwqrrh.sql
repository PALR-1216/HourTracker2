-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: baibbp5jdlgsamiwqrrh-mysql.services.clever-cloud.com:3306
-- Generation Time: Jun 29, 2023 at 03:05 AM
-- Server version: 8.0.15-5
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `baibbp5jdlgsamiwqrrh`
--

-- --------------------------------------------------------

--
-- Table structure for table `FeedBack`
--

CREATE TABLE `FeedBack` (
  `ID` int(11) NOT NULL,
  `Name` varchar(80) DEFAULT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `Message` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Hours`
--

CREATE TABLE `Hours` (
  `HourID` varchar(150) DEFAULT NULL,
  `UserID` varchar(150) DEFAULT NULL,
  `ClockIn` varchar(70) DEFAULT NULL,
  `ClockOut` varchar(70) DEFAULT NULL,
  `TotalHours` double(15,2) DEFAULT NULL,
  `Startbreak` varchar(70) DEFAULT NULL,
  `EndBreak` varchar(70) DEFAULT NULL,
  `TotalBreak` double(15,2) DEFAULT NULL,
  `TotalEarned` double(15,2) DEFAULT NULL,
  `Date` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `User_id` varchar(200) NOT NULL,
  `User_Name` varchar(150) DEFAULT NULL,
  `User_email` varchar(150) DEFAULT NULL,
  `User_wage` decimal(15,2) DEFAULT NULL,
  `User_deduction` decimal(15,2) DEFAULT NULL,
  `Users_overtimeType` decimal(5,2) DEFAULT NULL,
  `User_EndPeriodDate` varchar(50) NOT NULL,
  `Users_Password` varchar(250) DEFAULT NULL,
  `AccountCreated` varchar(80) NOT NULL,
  `Payment` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`User_id`, `User_Name`, `User_email`, `User_wage`, `User_deduction`, `Users_overtimeType`, `User_EndPeriodDate`, `Users_Password`, `AccountCreated`, `Payment`) VALUES
('cq6v1WFEU2erKEJHI6Xkg', 'airam', 'airam@gmail.com', '11.00', '0.11', '0.50', '2023-06-16', '$2a$05$HzpIng4pDwb1Ho91mHRq..ayL0uOYw9X.4oNFKc8vuMEF3v/5ACMm', '23/06/02', 'Biweekly'),
('R5wIyK73Dn0-HibMhxDJV', 'admin', 'admin@gmail.com', '8.50', '0.08', '0.50', '2023-06-09', '$2a$05$o.gDlCK5kZ1GY8XbtaoUIeMtHQL10aM6F8U0Lp1/oFf3JV6pe6mlW', '23/05/31', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `FeedBack`
--
ALTER TABLE `FeedBack`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`User_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `FeedBack`
--
ALTER TABLE `FeedBack`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
