/* START OF DATABASE CREATION */

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
	avgrating NUMERIC(2,1) NOT NULL,
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

CREATE TABLE CareTakerCatersPetCategory (
	username VARCHAR(20) NOT NULL,
	category VARCHAR(20) NOT NULL,
	price NUMERIC(31,2) NOT NULL,
	PRIMARY KEY(username, category),
	FOREIGN KEY(username) REFERENCES CareTaker(username),
	FOREIGN KEY(category) REFERENCES PetCategory(category)	
);

CREATE TABLE Pet (
	username VARCHAR(20),
	name VARCHAR(50) UNIQUE,
	dateofbirth DATE NOT NULL,
	gender VARCHAR(1) NOT NULL,
	description VARCHAR(100) NOT NULL,
	specialreqs VARCHAR(100),
	personality VARCHAR(100) NOT NULL,
	category VARCHAR(20) NOT NULL,
	PRIMARY KEY(username, name),
	FOREIGN KEY(username) REFERENCES AppUser(username),	
	FOREIGN KEY(category) REFERENCES PetCategory(category)	
);

/*----------------------------------------------------*/

CREATE TABLE Job (
	ctusername VARCHAR(20),
	pousername VARCHAR(20),	
	petname VARCHAR(20),
	startdate DATE,
	enddate DATE NOT NULL,
	requestdate TIMESTAMP NOT NULL,
	status VARCHAR(10),
	rating NUMERIC(2,1),
	paymenttype VARCHAR(20) NOT NULL,
	deliverytype VARCHAR(20) NOT NULL,
	amountpaid NUMERIC(31,2) NOT NULL,
	review VARCHAR(1000),
	PRIMARY KEY(pousername, ctusername, petname, startdate),
	FOREIGN KEY(pousername, petname) REFERENCES Pet(username, name),
	FOREIGN KEY(ctusername) REFERENCES CareTaker(username),
	CHECK(pousername != ctusername),
	CHECK(startdate < enddate),
	CHECK(requestdate < enddate)
);

/* END OF DATABASE CREATION */

/* START OF TRIGGERS */
/* Update CareTaker.avgrating through Job */
/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION update_avg_rating()
  RETURNS TRIGGER AS
$$
DECLARE 
    newavgrating NUMERIC(2,1);
BEGIN
  newavgrating = (SELECT AVG(NULLIF(rating,0)) FROM job WHERE ctusername = OLD.ctusername);

  IF newavgrating IS NULL THEN
	UPDATE caretaker
    SET avgrating = 0
	WHERE username = OLD.ctusername;
    RETURN NEW;
    ELSE
	UPDATE caretaker
	SET avgrating = newavgrating
	WHERE username = OLD.ctusername;
    RETURN NEW;
  END IF;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_avg_rating
AFTER UPDATE
ON job
FOR EACH ROW
EXECUTE PROCEDURE update_avg_rating();

/* Create default Cater entry when new CareTaker created */
/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION create_petcat()
  RETURNS TRIGGER AS
$$
BEGIN
  INSERT INTO CareTakerCatersPetCategory(username, category, price)
  VALUES(NEW.username, 'Dogs', (SELECT baseprice FROM petcategory where category = 'Dogs'));
  RETURN NEW;
END
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER create_petcat
AFTER INSERT
ON caretaker
FOR EACH ROW
EXECUTE PROCEDURE create_petcat();

/* Caculate Job total price based on days and base price */
/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION calc_job_price()
  RETURNS TRIGGER AS
$$
BEGIN
  IF new.status = 'PENDING' THEN 
  new.amountpaid := 0.0;
  ELSEIF new.status = 'CANCELLED' THEN
  new.amountpaid := 0.0;
  ELSE 
  new.amountpaid := (date_part('day', new.enddate::timestamp - new.startdate::timestamp) 
  					* (SELECT price FROM caretakercaterspetcategory WHERE username = new.ctusername AND category 
					= (SELECT category FROM pet WHERE username = new.pousername AND name = new.petname)));
  END IF;
  RETURN NEW;  
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER calc_job_price
BEFORE INSERT
ON job
FOR EACH ROW
EXECUTE PROCEDURE calc_job_price();

/* Caculate base price with reference to rating when insert new pets caretaker can take */
/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION set_baseprice()
  RETURNS TRIGGER AS
$$
DECLARE 
    newavgrating NUMERIC(2,1);
    currbaseprice NUMERIC(31,2);
BEGIN
    newavgrating = (SELECT avgrating FROM caretaker WHERE username = new.username);
    currbaseprice = (SELECT baseprice FROM petcategory WHERE category = new.category);

    IF newavgrating = 5.0 THEN
    new.price := currbaseprice * 2;
    RETURN NEW;
    ELSEIF newavgrating < 5.0 AND newavgrating >= 4.5 THEN
    new.price := currbaseprice * 1.75;
    RETURN NEW;
    ELSEIF newavgrating < 4.5 AND newavgrating >= 4.0 THEN
    new.price := currbaseprice * 1.5;
    RETURN NEW;
    ELSEIF newavgrating < 4.0 AND newavgrating >= 3.5 THEN
    new.price := currbaseprice * 1.25;
    RETURN NEW;
    ELSE
    new.price := currbaseprice;
    RETURN NEW;
  END IF;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER set_baseprice
BEFORE INSERT
ON CareTakerCatersPetCategory
FOR EACH ROW
EXECUTE PROCEDURE set_baseprice();

/* Caculate base price with reference to rating on update */
/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION update_baseprice()
  RETURNS TRIGGER AS
$$
DECLARE
    currbaseprice NUMERIC(31,2);
  newprice NUMERIC(31,2);
  cater CareTakerCatersPetCategory%rowtype;
BEGIN

  FOR cater IN SELECT * FROM CareTakerCatersPetCategory WHERE username = new.username LOOP
    currbaseprice = (SELECT baseprice FROM petcategory WHERE category = cater.category);

    IF new.avgrating = 5.0 THEN
      UPDATE CareTakerCatersPetCategory
      SET price = currbaseprice * 2 
      WHERE username = new.username AND category = cater.category;
      RETURN NEW;
    ELSEIF new.avgrating < 5.0 AND new.avgrating >= 4.5 THEN
      UPDATE CareTakerCatersPetCategory
      SET price = currbaseprice * 1.75
      WHERE username = new.username AND category = cater.category;
      RETURN NEW;
    ELSEIF new.avgrating < 4.5 AND new.avgrating >= 4.0 THEN
      UPDATE CareTakerCatersPetCategory
      SET price = currbaseprice * 1.5
      WHERE username = new.username AND category = cater.category;
      RETURN NEW;
    ELSEIF new.avgrating < 4.0 AND new.avgrating >= 3.5 THEN
      UPDATE CareTakerCatersPetCategory
      SET price = currbaseprice * 1.25
      WHERE username = new.username AND category = cater.category;
      RETURN NEW;
    ELSE
      UPDATE CareTakerCatersPetCategory
      SET price = currbaseprice
      WHERE username = new.username AND category = cater.category;
      RETURN NEW;
      
    END IF;
  END LOOP;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER update_baseprice
AFTER UPDATE
ON caretaker
FOR EACH ROW
EXECUTE PROCEDURE update_baseprice();

/*----------------------------------------------------*/

CREATE OR REPLACE FUNCTION limit_leaves()
    RETURNS TRIGGER AS
$$
DECLARE
  prevdate fulltimeappliesleaves%rowtype;
    prevprevdate DATE;
    lastdate DATE;
    consecdays integer := 0;
BEGIN
    FOR prevdate IN SELECT * FROM fulltimeappliesleaves 
        WHERE username = new.username 
          AND date_part('year', leavedate) = date_part('year', CURRENT_DATE) 
          ORDER BY leavedate DESC LOOP

    prevprevdate = (SELECT * FROM fulltimeappliesleaves 
      WHERE username = new.username 
        AND leavedate < prevdate.leavedate 
        ORDER BY leavedate DESC
        LIMIT 1)
    IF new.leavedate < CURRENT_DATE THEN
      RAISE EXCEPTION 'Please select a future date';
    ELSE
      IF prevdate.leavedate - prevprevdate >= 150 THEN
        consecdays := consecdays + 1;
      END IF;
    END IF;

    END LOOP;

  lastdate = (SELECT * FROM fulltimeappliesleaves 
      WHERE username = new.username 
        AND leavedate < CURRENT_DATE 
        ORDER BY leavedate DESC LIMIT 1);
  IF CURRENT_DATE - lastdate >= 150 THEN
    consecdays := consecdays + 1;
  END IF;

  IF consecdays < 2 THEN
    RAISE EXCEPTION 'Invalid date, you need to work for at least 2x150 consecutive days a year.';
  END IF;
  
  RETURN NEW;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER limit_leaves
BEFORE INSERT
ON fulltimeappliesleaves
FOR EACH ROW
EXECUTE PROCEDURE limit_leaves();

/*----------------------------------------------------*/

/* END OF TRIGGERS */