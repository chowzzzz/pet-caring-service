const sql = {};

sql.query = {
	// Users
	all_users: "SELECT * FROM appuser ORDER BY username",
	get_user: "SELECT * FROM appuser WHERE username = $1",
	get_petowners: `SELECT DISTINCT u.username, u.name, u.email, u.gender, u.address, u.dateofbirth 
					FROM appuser u JOIN pet p ON u.username = p.username
					WHERE u.isactive = 't'
					ORDER BY u.username`,
	get_caretakers: `SELECT u.username, u.name, u.email, u.gender, u.address, u.dateofbirth 
					FROM appuser u JOIN caretaker ct ON u.username = ct.username
					WHERE u.isactive = 't'
					ORDER BY u.username`,
	get_caretaker: "SELECT username FROM caretaker WHERE username = $1",

	// Pet
	all_pets: "SELECT * FROM pet WHERE username = $1",

	// Pet category
	all_pet_categories: "SELECT * FROM petcategory",

	// Petowner profile Queries
	petowner_job: "SELECT * FROM job WHERE pousername = $1",
	petowner_creditCard: "SELECT * FROM petownerregisterscreditcard WHERE username = $1 ORDER BY expirydate ASC",

	// Caretaker profile Queries
	caretaker_petType: "SELECT * FROM caretaker_petcategory WHERE username = $1",
	caretaker_petLimit: "",
	caretaker_review: "SELECT review FROM job WHERE ctusername = $1",
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
	underperforming_ct: `SELECT ctusername AS username, SUM(date_part('day', enddate::timestamp - startdate::timestamp)) AS petdays, ROUND(AVG(CAST(rating AS numeric)), 2) AS rating, SUM(amountpaid) AS amountearned
							FROM job
							WHERE date_part('month',startdate) = date_part('month', CURRENT_DATE)
								AND date_part('year',startdate) = date_part('year', CURRENT_DATE)
							GROUP BY ctusername
							ORDER BY petdays ASC
							LIMIT 10;`,
	get_admins: "SELECT * FROM administrator WHERE isactive = 't' ORDER BY username ASC",
	get_admin: "SELECT * FROM administrator WHERE username = $1",
	edit_admin: "UPDATE administrator SET name = $1, email = $2, password = $3 WHERE username = $4",
	delete_admin: "UPDATE administrator SET isactive = $1 WHERE username = $2",

	//Sign In
	signin_query: "SELECT * FROM appuser WHERE username = $1",
	adminsignin_query: "SELECT * FROM administrator WHERE username = $1",

	// Register appuser
	register_user: "INSERT INTO appuser (username, name, email, password, gender, address, dateofbirth) VALUES ($1,$2,$3,$4,$5,$6,$7)",

	// Register admin
	register_admin: "INSERT INTO administrator VALUES ($1,$2,$3,$4,CURRENT_DATE,TRUE)",

	// Register credit card
	register_credit_card: "INSERT INTO petownerregisterscreditcard VALUES ($1,$2,$3,$4,$5)",

	// Register credit card
	register_pet: "INSERT INTO pet VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",

	search_caretaker: `SELECT *
		FROM fulltime f JOIN appuser u ON f.username = u.username
		WHERE NOT EXISTS (
			SELECT leavedate
			FROM fulltimeappliesleaves
			WHERE username = f.username AND leavedate >= $1::date AND leavedate <= $2::date
		)
	`

	/*// Counting & Average
	  count_play: 'SELECT COUNT(winner) FROM game_plays WHERE user1=$1 OR user2=$1',
	  count_wins: 'SELECT COUNT(winner) FROM game_plays WHERE winner=$1',
	  avg_rating: 'SELECT AVG(rating) FROM user_games INNER JOIN game_list ON user_games.gamename=game_list.gamename WHERE username=$1',
  	
	  // Information
	  page_game: 'SELECT * FROM game_list WHERE ranking >= $1 AND ranking <= $2 ORDER BY ranking ASC',
	  page_lims: 'SELECT * FROM game_list ORDER BY ranking ASC LIMIT 10 OFFSET $1',
	  ctx_games: 'SELECT COUNT(*) FROM game_list',
	  all_games: 'SELECT ranking,game_list.gamename AS game,rating FROM user_games INNER JOIN game_list ON user_games.gamename=game_list.gamename WHERE username=$1 ORDER BY ranking ASC',
	  all_plays: 'SELECT gamename AS game, user1, user2, winner FROM game_plays WHERE user1=$1 OR user2=$1',
  	
	  // Insertion
	  add_game: 'INSERT INTO user_games (username, gamename) VALUES($1,$2)',
	  add_play: 'INSERT INTO game_plays (user1, user2, gamename, winner) VALUES($1,$2,$3,$4)',
	  add_user: 'INSERT INTO username_password (username, password, status, first_name, last_name) VALUES ($1,$2,\'Bronze\',$3,$4)',
  	
	  // Login
	  userpass: 'SELECT * FROM username_password WHERE username=$1',
  	
	  // Update
	  update_info: 'UPDATE username_password SET first_name=$2, last_name=$3 WHERE username=$1',
	  update_pass: 'UPDATE username_password SET password=$2 WHERE username=$1',
  	
	  // Search
	  search_game: 'SELECT * FROM game_list WHERE lower(gamename) LIKE $1',*/
};

module.exports = sql;
