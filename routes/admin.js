var express = require("express");
var router = express.Router();

/* Connect to DB */
const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
const monthlyJobQuery = `SELECT COUNT(*) FROM job 
						WHERE date_part('month', startdate) = date_part('month', CURRENT_DATE) 
							AND date_part('year', startdate) = date_part('year', CURRENT_DATE);`;

const topCaretakers = `SELECT username, totalamount FROM caretakerearnssalary 
						WHERE date_part('month', salarydate) = date_part('month', CURRENT_DATE) 
							AND date_part('year', salarydate) = date_part('year', CURRENT_DATE)
						ORDER BY totalamount DESC
						LIMIT 10`;

const jobPerf = `SELECT TO_CHAR(TO_DATE(m.month::text, 'MM'), 'Mon') AS month, COALESCE(SUM(job.amountpaid), 0) AS amountpaid
				FROM generate_series(1,12) AS m(month)
				LEFT OUTER JOIN job ON date_part('year', job.startdate) = date_part('year', CURRENT_DATE)
					AND date_part('month', job.startdate) = m.month
				GROUP BY m.month
				ORDER BY m.month`;

/* GET admin page. */
router.get("/", function (req, res, next) {
	pool.query(monthlyJobQuery, (err, monthly_job) => {
		if (err) {
			console.error(err);
		}
		pool.query(topCaretakers, (err, top_caretakers) => {
			if (err) {
				console.error(err);
			}
			pool.query(jobPerf, (err, job_perf) => {
				if (err) {
					console.error(err);
				}
				let username = top_caretakers.rows.map((a) => a.username);
				let totalAmount = top_caretakers.rows.map((a) => a.totalamount);

				let month = job_perf.rows.map((a) => a.month);
				let amountpaid = job_perf.rows.map((a) => a.amountpaid);
				console.log(amountpaid);
				res.render("admin", {
					title: "Admin",
					monthly_job: monthly_job.rows,
					username: username,
					totalAmount: totalAmount,
					month: month,
					amountpaid: amountpaid
				});
			});
		});
	});
});

module.exports = router;
