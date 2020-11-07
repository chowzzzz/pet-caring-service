const sql = {};

sql.query = {
	// Users
	all_users: "SELECT * FROM petowner ORDER BY username",
	get_user: "SELECT * FROM petowner WHERE username = $1",
	get_petowners: `SELECT DISTINCT u.username, u.name, u.email, u.gender, u.address, u.dateofbirth 
					FROM petowner u JOIN pet p ON u.username = p.username
					WHERE u.isactive = 't'
					ORDER BY u.username`,
	get_caretakers: `SELECT u.username, u.name, u.email, u.gender, u.address, u.dateofbirth 
					FROM petowner u JOIN caretaker ct ON u.username = ct.username
					WHERE u.isactive = 't'
					ORDER BY u.username`,
	get_caretaker: "SELECT * FROM caretaker WHERE username = $1",

	caretaker_activate: "INSERT INTO caretaker VALUES ($1, 0)",

	// Pet
	all_pets: "SELECT * FROM pet WHERE username = $1",

	// Pet category
	all_pet_categories: "SELECT * FROM petcategory",

	// Petowner profile Queries
	petowner_job: "SELECT * FROM job WHERE pousername = $1",
	petowner_creditCard: "SELECT * FROM petownerregisterscreditcard WHERE username = $1 ORDER BY expirydate ASC",
	petowner_job: "SELECT * FROM job WHERE pousername = $1 ORDER BY status ASC",
	petowner_creditCard: "SELECT * FROM petownerregisterscreditcard WHERE username = $1 ORDER BY expirydate ASC",
	register_credit_card: "INSERT INTO petownerregisterscreditcard VALUES ($1,$2,$3,$4,$5)",
	register_pet: "INSERT INTO pet VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
	remove_pet: "DELETE FROM pet WHERE username = $1 AND name = $2",
	edit_profile: "UPDATE appuser SET name = $1, email = $2, password = $3, address = $4 WHERE username = $5",
	delete_profile: "UPDATE appuser SET isactive = $1 WHERE username = $2",
	update_review: "UPDATE job SET rating = $1, review = $2, status = 'REVIEWED' WHERE pousername = $3 AND ctusername = $4 AND petname = $5 AND startdate = $6",
	set_completed: "UPDATE job SET status = 'COMPLETED' WHERE pousername = $1 AND ctusername = $2 AND petname = $3 AND startdate = $4",

	// Caretaker profile Queries

	caretaker_petType: "SELECT c.category, pc.baseprice FROM caretakercaterspetcategory c JOIN petcategory pc WHERE c.username = $1",

	caretaker_checkstatus: "SELECT * FROM caretaker WHERE username = $1",
	caretaker_aspetowner: "SELECT * FROM caretaker NATURAL JOIN petowner WHERE username = $1",
	caretaker_petType: "SELECT * FROM caretaker_petcategory WHERE username = $1",

	caretaker_petLimit: "",
	caretaker_review: "SELECT review FROM job WHERE ctusername = $1",
	caretaker_rating: "SELECT avgrating FROM caretaker WHERE ctusername = $1",
	caretaker_jobview: "SELECT * FROM job WHERE ctusername = $1",
	caretaker_category: "SELECT * FROM caretakercaterspetcategory WHERE username = $1",

	yearly_petdays: `SELECT SUM(date_part('day', enddate::timestamp - startdate::timestamp)) AS petdays
				FROM job
				WHERE date_part('year',startdate) = date_part('year', CURRENT_DATE)
					AND ctusername = $1`,
	monthly_petdays: `SELECT SUM(date_part('day', enddate::timestamp - startdate::timestamp)) AS petdays, SUM(amountpaid) AS amountearned
				FROM job
				WHERE date_part('month',startdate) = date_part('month', CURRENT_DATE)
					AND date_part('year',startdate) = date_part('year', CURRENT_DATE)
					AND ctusername = $1`,
	caretaker_salary: `SELECT totalamount
				FROM caretakerearnssalary
				WHERE date_part('month',salarydate) = date_part('month', CURRENT_DATE)
					AND date_part('year',salarydate) = date_part('year', CURRENT_DATE)
					AND username = $1`,
	get_reviews: "SELECT pousername, petname, enddate, rating, review FROM job WHERE ctusername = $1;",
	get_salary: "SELECT * FROM caretakerearnssalary WHERE username = $1 ORDER BY salarydate DESC;",
	get_salaries: "SELECT * FROM caretakerearnssalary ORDER BY salarydate DESC",

	// Caretaker Availability Queries
	// full time
	get_fulltime: "SELECT username FROM fulltime WHERE username = $1",
	fulltime_leavedays: "SELECT * FROM fulltimeappliesleaves WHERE username = $1",
	fulltime_leaves: "SELECT COUNT(*) AS leaves FROM fulltimeappliesleaves WHERE username = $1",
	// part time
	get_parttime: "SELECT username FROM parttime WHERE username = $1",
	parttime_availdays: "SELECT * FROM parttimeindicatesavailability WHERE username = $1",

	// Admin
	get_admin: "SELECT * FROM administrator WHERE username = $1",
	monthly_job: `SELECT COUNT(*) FROM job 
					WHERE date_part('month', startdate) = date_part('month', CURRENT_DATE) 
						AND date_part('year', startdate) = date_part('year', CURRENT_DATE)`,
	monthly_salary: `SELECT SUM(totalamount) FROM caretakerearnssalary 
						WHERE date_part('month', salarydate) = date_part('month', CURRENT_DATE) 
							AND date_part('year', salarydate) = date_part('year', CURRENT_DATE)`,
	top_caretakers: `SELECT username, totalamount FROM caretakerearnssalary 
						WHERE date_part('month', salarydate) = date_part('month', CURRENT_DATE) 
							AND date_part('year', salarydate) = date_part('year', CURRENT_DATE)
						ORDER BY totalamount DESC
						LIMIT 10`,
	job_performance: `SELECT TO_CHAR(TO_DATE(m.month::text, 'MM'), 'Mon') AS month, COALESCE(SUM(job.amountpaid), 0) AS amountpaid
						FROM generate_series(1,12) AS m(month)
						LEFT OUTER JOIN job ON date_part('year', job.startdate) = date_part('year', CURRENT_DATE)
							AND date_part('month', job.startdate) = m.month
						GROUP BY m.month
						ORDER BY m.month`,
	underperforming_ct: `SELECT job.ctusername AS username, SUM(date_part('day', job.enddate::timestamp - job.startdate::timestamp)) AS petdays, SUM(job.amountpaid) AS amountearned, c.avgrating AS rating
							FROM job INNER JOIN caretaker c ON job.ctusername = c.username
							WHERE date_part('month',job.startdate) = date_part('month', CURRENT_DATE)
								AND date_part('year',job.startdate) = date_part('year', CURRENT_DATE)
							GROUP BY job.ctusername, c.avgrating
							ORDER BY petdays ASC
							LIMIT 10;`,
	get_admins: "SELECT * FROM administrator WHERE isactive = 't' ORDER BY username ASC",
	get_admin: "SELECT * FROM administrator WHERE username = $1",
	edit_admin: "UPDATE administrator SET name = $1, email = $2, password = $3 WHERE username = $4",
	delete_admin: "UPDATE administrator SET isactive = $1 WHERE username = $2",

	// Jobs
	get_jobs: "SELECT * FROM job ORDER BY startdate DESC",
	get_filtered_jobs: "SELECT * FROM job WHERE status = $1 ORDER BY startdate DESC",
	get_job: "SELECT * FROM job WHERE ctusername = $1 AND pousername = $2 AND petname = $3 AND startdate = $4::date;",

	// Sign In
	signin_query: "SELECT * FROM petowner WHERE username = $1",
	adminsignin_query: "SELECT * FROM administrator WHERE username = $1",

	// Register petowner
	register_user: "INSERT INTO petowner (username, name, email, password, gender, address, dateofbirth) VALUES ($1,$2,$3,$4,$5,$6,$7)",

	// Register admin
	register_admin: "INSERT INTO administrator VALUES ($1,$2,$3,$4,CURRENT_DATE,TRUE)",

	// Register credit card
	register_credit_card: "INSERT INTO petownerregisterscreditcard VALUES ($1,$2,$3,$4,$5)",

	// Register pet
	register_pet: "INSERT INTO pet VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",

	search_caretaker: `SELECT *
		FROM fulltime f JOIN petowner u ON f.username = u.username AND f.username <> $3
		JOIN caretaker c ON f.username = c.username
		WHERE NOT EXISTS (
			SELECT leavedate
			FROM fulltimeappliesleaves
			WHERE username = f.username AND leavedate >= $1::date AND leavedate <= $2::date
		)
	`
};

module.exports = sql;