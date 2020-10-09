\c postgres

DROP DATABASE IF EXISTS PetCaringService;
CREATE DATABASE PetCaringService;

\c petcaringservice

/*----------------------------------------------------*/

CREATE TABLE Person (
	username VARCHAR(20),
	password VARCHAR(20) NOT NULL UNIQUE,
	name VARCHAR(100) NOT NULL UNIQUE,
	email VARCHAR(100) NOT NULL UNIQUE,
	joindate DATE NOT NULL,
	isactive BOOLEAN NOT NULL,
	PRIMARY KEY(username)
);

CREATE TABLE Administrator (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES Person(username)
);

CREATE TABLE "User" (
	username VARCHAR(20),
	gender VARCHAR(1) NOT NULL,
	address VARCHAR(100) NOT NULL,
	dateofbirth DATE NOT NULL, 
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES Person(username)	
);

/*----------------------------------------------------*/

CREATE TABLE CareTaker (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES "User"(username)	
);

CREATE TABLE CareTakerEarnsSalary (
	username VARCHAR(20),
	salarydate DATE NOT NULL,
	totalamount NUMERIC(31, 2) NOT NULL,
	PRIMARY KEY(username, salarydate),
	FOREIGN KEY(username) REFERENCES CareTaker(username)
);

/*----------------------------------------------------*/

CREATE TABLE FullTime (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES CareTaker(username)		
);

CREATE TABLE FullTimeAppliesLeaves (
	username VARCHAR(20),
	"date" DATE,
	PRIMARY KEY(username, "date"),
	FOREIGN KEY(username) REFERENCES FullTime(username)		
);

CREATE TABLE PartTime (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES CareTaker(username)		
);

CREATE TABLE PartTimeIndicatesAvailability (
	username VARCHAR(20),
	startdate DATE NOT NULL,
	enddate DATE NOT NULL,
	PRIMARY KEY(username, startDate, endDate),
	FOREIGN KEY(username) REFERENCES PartTime(username)
);

/*----------------------------------------------------*/

CREATE TABLE PetOwner (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES "User"(username)	
);

CREATE TABLE PetOwnerRegistersCreditCard (
	username VARCHAR(20),
	"number" VARCHAR(20) UNIQUE,
	cvv VARCHAR(20) NOT NULL,
	fullname VARCHAR(100) NOT NULL,
	expirydate DATE NOT NULL,
	PRIMARY KEY(username, "number"),
	FOREIGN KEY(username) REFERENCES PetOwner(username)	
);

/*----------------------------------------------------*/

CREATE TABLE PetCategory (
	category VARCHAR(20),
	baseprice NUMERIC(31,2) NOT NULL,
	PRIMARY KEY(category)
);

CREATE TABLE Pet (
	username VARCHAR(20),
	name VARCHAR(50) UNIQUE,
	age INTEGER NOT NULL,
	gender VARCHAR(1) NOT NULL,
	description VARCHAR(100) NOT NULL,
	specialreqs VARCHAR(100),
	personality VARCHAR(100) NOT NULL,
	PRIMARY KEY(username, name),
	FOREIGN KEY(username) REFERENCES PetOwner(username)	
);

/*----------------------------------------------------*/

CREATE TABLE Job (
	usernamePetOwner VARCHAR(20),
	usernameCareTaker VARCHAR(20),
	namePet VARCHAR(20),
	startdate DATE,
	enddate DATE NOT NULL,
	"timestamp" TIMESTAMP NOT NULL,
	rating NUMERIC(1,1),
	paymenttype VARCHAR(20) NOT NULL,
	deliverytype VARCHAR(20) NOT NULL,
	amountpaid NUMERIC(31,2) NOT NULL,
	review VARCHAR(1000),
	PRIMARY KEY(usernamePetOwner, usernameCareTaker, namePet, startDate),
	FOREIGN KEY(usernamePetOwner) REFERENCES PetOwner(username),
	FOREIGN KEY(usernameCareTaker) REFERENCES CareTaker(username),
	FOREIGN KEY(namePet) REFERENCES Pet(name)
);