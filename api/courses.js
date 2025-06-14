//students restfull api
const express = require("express");
const sqlite = require("sqlite3");
const config = require("../config");
const router = express.Router();

const table = "courses";

router.get("/",(req,res)=>{
	let sql = "SELECT `edpcode`, `subcode`, `descriptivetitle`, `schedule`, `room`, `units` FROM `"+table+"`";
	const db = new sqlite.Database(config.sqlitedb);
	db.all(sql,(err,rows)=>{
		if(err){
			console.log("error:"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during course fetch.', error: err.message });
		}
		db.close();
		return res.status(200).json(rows);
	});
});

router.post("/",(req,res)=>{
	let qmark = [];
	let body = req.body;
	let keys = Object.keys(body);
	let values = Object.values(body);
	keys.forEach((item)=>{ qmark.push('?'); });
	//join the keys together as 1 string separated by backtick and comma
	let flds = keys.join("`,`");
	//join the qmark together as 1 string separated by comma
	let q = qmark.join(',');
	//create the sql string
	let sql = "INSERT INTO `"+table+"`(`"+flds+"`) VALUES("+q+")";
	console.log(sql);
	const db = new sqlite.Database(config.sqlitedb);
	db.run(sql,values,(err)=>{
		if(err){
			console.log("error : "+err);
			db.close();
			res.status(500).json({ message: 'Database error during course insert.', error: err.message });
		}
		db.close();
		res.status(200).json({message:'New Course Added'});
	});
});

router.delete("/:edpcode",(req,res)=>{
	let edpcode = req.params.edpcode;
	let sql = "DELETE FROM `"+table+"` WHERE `edpcode`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.run(sql,edpcode,(err)=>{
		if(err){
			console.log("error :"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during course delete.', error: err.message });
		}
		db.close();
		return res.status(200).json({message:'Course Deleted'});
	})
});


router.get("/:edpcode",(req,res)=>{
	let edpcode = req.params.edpcode;
	let sql = "SELECT * FROM `"+table+"` WHERE `edpcode`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.get(sql,edpcode,(err,row)=>{
		if(err){
			console.log("error :"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during course fetch by ID.', error: err.message });
		}
		db.close();
		return res.status(200).json(row);
	})
});

router.put("/",(req,res)=>{
	let body = req.body;
	console.log("PUT request body:", body);
	const originalEdpcode = body.originalEdpcode;
	const updatedFields = {};
	
	// Filter out originalEdpcode and prepare fields for update
	for (const key in body) {
		if (key !== 'originalEdpcode') {
			updatedFields[key] = body[key];
		}
	}
	console.log("Updated fields (excluding originalEdpcode):", updatedFields);

	let setClauses = [];
	let values = [];
	for (const key in updatedFields) {
		setClauses.push(`\`${key}\` = ?`);
		values.push(updatedFields[key]);
	}
	
	if (setClauses.length === 0) {
		return res.status(400).json({ message: 'No fields to update' });
	}
	
	let sql = `UPDATE \`${table}\` SET ${setClauses.join(',')} WHERE \`edpcode\` = ?`;
	values.push(originalEdpcode);
	
	console.log("Generated SQL for UPDATE:", sql);
	console.log("Values for UPDATE query:", values);
	
	const db = new sqlite.Database(config.sqlitedb);
	db.run(sql,values,(err)=>{
		if(err){
			console.log("error : "+err);
			db.close();
			res.status(500).json({ message: 'Database error during course update.', error: err.message });
		}
		else{
			db.close();
			res.status(200).json({message:'Course Updated'});
		}
	});
});

// New endpoint to get students by EDP code (subject)
router.get("/:edpcode/students", (req, res) => {
	const edpcode = req.params.edpcode;
	const sql = `SELECT s.* FROM students s INNER JOIN student_enrollments se ON s.idno = se.student_idno WHERE se.edp_code = ?`;
	const db = new sqlite.Database(config.sqlitedb);
	db.all(sql, [edpcode], (err, rows) => {
		if (err) {
			console.error("Error fetching enrolled students:", err);
			db.close();
			return res.status(500).json({ message: 'Error fetching enrolled students.' });
		}
		db.close();
		return res.status(200).json(rows);
	});
});

router.post("/enroll",(req,res)=>{
	const { studentIdno, edpcode } = req.body;
	console.log(`Enrollment request for Student ID: ${studentIdno} in EDP Code: ${edpcode}`);
	
	const db = new sqlite.Database(config.sqlitedb);
	// Check if the student is already enrolled in this subject
	db.get(`SELECT * FROM student_enrollments WHERE student_idno = ? AND edp_code = ?`, [studentIdno, edpcode], (err, row) => {
		if (err) {
			console.error("Error checking existing enrollment:", err);
			db.close();
			return res.status(500).json({ message: 'Error checking enrollment.' });
		}
		if (row) {
			db.close();
			return res.status(409).json({ message: 'Student already enrolled in this subject.' });
		}
		
		// Proceed with enrollment
		const insertSql = `INSERT INTO student_enrollments (student_idno, edp_code) VALUES (?, ?)`;
		db.run(insertSql, [studentIdno, edpcode], function(insertErr) {
			if (insertErr) {
				console.error("Error during enrollment:", insertErr);
				db.close();
				return res.status(500).json({ message: 'Failed to enroll student.' });
			}
			db.close();
			res.status(200).json({ message: 'Student enrolled successfully!' });
		});
	});
});

// New endpoint to unenroll a student from a subject
router.post("/unenroll", (req, res) => {
	const { studentIdno, edpcode } = req.body;
	console.log(`Unenrollment request for Student ID: ${studentIdno} from EDP Code: ${edpcode}`);

	const sql = `DELETE FROM student_enrollments WHERE student_idno = ? AND edp_code = ?`;
	const db = new sqlite.Database(config.sqlitedb);
	db.run(sql, [studentIdno, edpcode], function(err) {
		if (err) {
			console.error("Error during unenrollment:", err);
			db.close();
			return res.status(500).json({ message: 'Failed to unenroll student.' });
		}
		if (this.changes === 0) {
			db.close();
			return res.status(404).json({ message: 'Enrollment not found.' });
		}
		db.close();
		res.status(200).json({ message: 'Student unenrolled successfully!' });
	});
});

module.exports = router;
