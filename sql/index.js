const sql = {};

sql.query = {
	// Users
	all_users: "SELECT * FROM appuser",
	get_user: "SELECT * FROM appuser WHERE username = $1",

	// Pet
	all_pets: "SELECT * FROM pet WHERE username = $1",

	// Job
	petowner_job: "SELECT * FROM job WHERE pousername = $1",

	// Credit card
	petowner_creditcard: "SELECT * FROM petownerregisterscreditcard WHERE username = $1",

	// Caretaker profile Queries
	caretaker_petType: "SELECT * FROM caretaker_petcategory WHERE username = $1",
	caretaker_petLimit: "",
	caretaker_review: "SELECT review FROM job WHERE ctusername = $1",
	caretaker_jobview: "SELECT * FROM job WHERE ctusername = $1",

	// Caretaker Availability Queries
	// full time
	fulltime_leavedays: "SELECT * FROM fulltimeappliesleaves WHERE username = $1",
	// part time
	parttime_availdays: "SELECT * FROM parttimeindicatesavailability WHERE username = $1",

	// Admin
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
	//Sign In
	signin_query: "SELECT * FROM appuser WHERE username = $1",

	// Register appuser
	register_user:
		"INSERT INTO appuser (username, name, email, password, gender, address, dateofbirth) VALUES($1,$2,$3,$4,$5,$6,$7)",

	// Register credit card
	register_credit_card:
		"INSERT INTO petownerregisterscreditcard (username, cardnumber, nameoncard, cvv, expirydate) VALUES($1,$2,$3,$4,$5)"

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
