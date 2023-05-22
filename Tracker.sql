-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 22, 2023 at 04:38 AM
-- Server version: 5.7.32
-- PHP Version: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `HourTracker2`
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
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `User_id` varchar(200) NOT NULL,
  `User_Name` varchar(150) DEFAULT NULL,
  `User_email` varchar(150) DEFAULT NULL,
  `User_wage` decimal(15,2) DEFAULT NULL,
  `User_deduction` decimal(15,2) DEFAULT NULL,
  `Users_overtimeType` decimal(5,2) DEFAULT NULL,
  `Users_PayShedule` varchar(100) DEFAULT NULL,
  `Users_Password` varchar(250) DEFAULT NULL,
  `AccountCreated` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`User_id`, `User_Name`, `User_email`, `User_wage`, `User_deduction`, `Users_overtimeType`, `Users_PayShedule`, `Users_Password`, `AccountCreated`) VALUES
('efgXcA8rojsanVMuabBd4', 'Eli', 'sdsdds@gmail.com', '11.00', '0.11', '0.50', 'Weekly', '$2a$05$U49N3juKOSPYkH8OUDVcQug5vFEF9TKipsgbAgJiq1.4lBcdu4/CO', '23/05/21');

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
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
