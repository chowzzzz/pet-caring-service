\c postgres

DROP DATABASE IF EXISTS PetCaringService;
CREATE DATABASE PetCaringService;

\c petcaringservice

/*----------------------------------------------------*/

CREATE TABLE Administrator (
	username VARCHAR(20),
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(20) NOT NULL,
	joindate DATE NOT NULL,
	isactive BOOLEAN NOT NULL,
	PRIMARY KEY(username)
);

CREATE TABLE AppUser (
	username VARCHAR(20),
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(20) NOT NULL,
	joindate DATE NOT NULL,
	isactive BOOLEAN NOT NULL,
	gender VARCHAR(1) NOT NULL,
	address VARCHAR(100) NOT NULL,
	dateofbirth DATE NOT NULL,
	PRIMARY KEY(username)
);

/*----------------------------------------------------*/

CREATE TABLE CareTaker (
	username VARCHAR(20),
	PRIMARY KEY(username),
	FOREIGN KEY(username) REFERENCES AppUser(username)
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
	leavedate DATE,
	PRIMARY KEY(username, leavedate),
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

CREATE TABLE PetOwnerRegistersCreditCard (
	username VARCHAR(20),
cardnumber VARCHAR(20) UNIQUE,
nameoncard VARCHAR(100) NOT NULL,
	cvv VARCHAR(20) NOT NULL,
	expirydate DATE NOT NULL,
	PRIMARY KEY(username, cardnumber),
	FOREIGN KEY(username) REFERENCES AppUser(username)	
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
	dateofbirth DATE NOT NULL,
	gender VARCHAR(1) NOT NULL,
	description VARCHAR(100) NOT NULL,
	specialreqs VARCHAR(100),
	personality VARCHAR(100) NOT NULL,
	PRIMARY KEY(username, name),
	FOREIGN KEY(username) REFERENCES AppUser(username)	
);

/*----------------------------------------------------*/

CREATE TABLE Job (
	pousername VARCHAR(20),
	ctusername VARCHAR(20),
	petname VARCHAR(20),
	startdate DATE,
	enddate DATE NOT NULL,
	requestdate TIMESTAMP NOT NULL,
	status VARCHAR(10),
	rating NUMERIC(1,1),
	paymenttype VARCHAR(20) NOT NULL,
	deliverytype VARCHAR(20) NOT NULL,
	amountpaid NUMERIC(31,2) NOT NULL,
	review VARCHAR(1000),
	PRIMARY KEY(pousername, ctusername, petname, startdate),
	FOREIGN KEY(pousername) REFERENCES AppUser(username),
	FOREIGN KEY(ctusername) REFERENCES CareTaker(username),
	FOREIGN KEY(petname) REFERENCES Pet(name)
);

/*----------------------------------------------------*/
