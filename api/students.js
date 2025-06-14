//students restfull api
const express = require("express");
const sqlite = require("sqlite3");
const config = require("../config");
const router = express.Router();

const table = "students";

router.get("/",(req,res)=>{
	let sql = "SELECT * FROM `"+table+"`";
	const db = new sqlite.Database(config.sqlitedb);
	db.all(sql,(err,rows)=>{
		if(err){
			console.log("error:"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during fetch.', error: err.message });
		}
		db.close();
		return res.status(200).json(rows);
	});
});

router.post("/",(req,res)=>{
	let qmark = [];
	let body = req.body;
	// Remove original_idno from the body as it's not a database column
	delete body.original_idno;
	
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
			return res.status(500).json({ message: 'Database error during insert.', error: err.message });
		}
		else{
			db.close();
			res.status(200).json({message:'New Student Added'});
		}
	});
});

router.delete("/:idno",(req,res)=>{
	let idno = req.params.idno;
	let sql = "DELETE FROM `"+table+"` WHERE `idno`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.run(sql,idno,(err)=>{
		if(err){
			console.log("error :"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during delete.', error: err.message });
		}
		else{
			db.close();
			return res.status(200).json({message:'Student Deleted'});
		}
	});
});


router.get("/:idno",(req,res)=>{
	let idno = req.params.idno;
	let sql = "SELECT * FROM `"+table+"` WHERE `idno`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.get(sql,idno,(err,row)=>{
		if(err){
			console.log("error :"+err);
			db.close();
			return res.status(500).json({ message: 'Database error during fetch by ID.', error: err.message });
		}
		if (!row) { // Check if no row was returned
            db.close();
            return res.status(404).json({ message: 'Student not found.' });
        }
		db.close();
		return res.status(200).json(row);
	})
});

router.put("/",(req,res)=>{
	let body = req.body;
	let original_idno = body.original_idno; // Get the old IDNO for the WHERE clause
	let updateFields = [];
	let updateValues = [];

	// Iterate over all fields except original_idno
	for (const key in body) {
		if (key !== 'original_idno') {
			updateFields.push(`\`${key}\` = ?`);
			updateValues.push(body[key]);
		}
	}

	// Add the original_idno to the values for the WHERE clause
	updateValues.push(original_idno);

	let sql = `UPDATE \`${table}\` SET ${updateFields.join(', ')} WHERE \`idno\` = ?`;

	console.log("SQL for update:", sql);
	console.log("Values for update:", updateValues);

	const db = new sqlite.Database(config.sqlitedb);
	db.run(sql, updateValues, (err)=>{
		if(err){
			console.log("error : " + err);
			db.close();
			res.status(500).json({ message: 'Database error during update.', error: err.message });
		}
		else{
			db.close();
			res.status(200).json({message:'Student Updated'});
		}
	});
});

// New endpoint to update student grades
router.put("/:idno/grades", (req, res) => {
	const idno = req.params.idno;
	const { prelim, midterm, semifinal, final, edpcode } = req.body;

	// Basic validation
	if (!edpcode || isNaN(parseFloat(prelim)) || isNaN(parseFloat(midterm)) || isNaN(parseFloat(semifinal)) || isNaN(parseFloat(final))) {
		return res.status(400).json({ message: 'Invalid input: missing EDP code or invalid grade values provided.' });
	}

	let p = parseFloat(prelim);
	let m = parseFloat(midterm);
	let sf = parseFloat(semifinal);
	let f = parseFloat(final);

	// Enforce grades between 1.0 and 5.0
	p = Math.max(1.0, Math.min(5.0, p));
	m = Math.max(1.0, Math.min(5.0, m));
	sf = Math.max(1.0, Math.min(5.0, sf));
	f = Math.max(1.0, Math.min(5.0, f));

	const fg = ((p + m + sf + f) / 4).toFixed(1);

	const db = new sqlite.Database(config.sqlitedb);

	// Check if a grade entry already exists for this student and subject
	db.get(`SELECT * FROM \`student_grades\` WHERE student_idno = ? AND edp_code = ?`, [idno, edpcode], (err, row) => {
		if (err) {
			console.error("Error checking existing grade entry:", err);
			db.close();
			return res.status(500).json({ message: 'Database error during grade check.', error: err.message });
		}

		let sql;
		let values;

		if (row) {
			// Update existing entry
			sql = `UPDATE \`student_grades\` SET prelim = ?, midterm = ?, semifinal = ?, final = ?, fg = ? WHERE student_idno = ? AND edp_code = ?`;
			values = [p, m, sf, f, fg, idno, edpcode];
		} else {
			// Insert new entry
			sql = `INSERT INTO \`student_grades\` (prelim, midterm, semifinal, final, fg, student_idno, edp_code) VALUES (?, ?, ?, ?, ?, ?, ?)`;
			values = [p, m, sf, f, fg, idno, edpcode];
		}

		db.run(sql, values, function(updateErr) {
			if (updateErr) {
				console.error("Error updating/inserting grades:", updateErr);
				db.close();
				return res.status(500).json({ message: 'Database error during grade update.', error: updateErr.message });
			}
			db.close();
			return res.status(200).json({ message: 'Grades updated successfully!', fg: parseFloat(fg) });
		});
	});
});

// New endpoint to get a specific student's grades for a specific subject
router.get("/:idno/subject-grades/:edpcode", (req, res) => {
	const idno = req.params.idno;
	const edpcode = req.params.edpcode;

	const sql = `
        SELECT 
            s.idno, s.lastname, s.firstname, s.course, s.level, 
            sg.prelim, sg.midterm, sg.semifinal, sg.final, sg.fg
        FROM \`students\` s
        LEFT JOIN \`student_grades\` sg ON s.idno = sg.student_idno AND sg.edp_code = ?
        WHERE s.idno = ?
    `;
	const db = new sqlite.Database(config.sqlitedb);

	db.get(sql, [edpcode, idno], (err, row) => {
		if (err) {
			console.error("Error fetching student grades for subject:", err);
			db.close();
			return res.status(500).json({ message: 'Database error during fetch.', error: err.message });
		}
		if (!row) {
			db.close();
			return res.status(404).json({ message: 'Student not found for this subject, or no grades assigned.' });
		}
		db.close();
		return res.status(200).json(row);
	});
});

// New endpoint to get all students for a specific subject with their grades
router.get("/subject/:edpcode", (req, res) => {
	const edpcode = req.params.edpcode;

	const sql = `
        SELECT 
            s.idno, s.lastname, s.firstname, s.course, s.level, 
            sg.prelim, sg.midterm, sg.semifinal, sg.final, sg.fg
        FROM \`students\` s
        INNER JOIN \`student_enrollments\` se ON s.idno = se.student_idno
        LEFT JOIN \`student_grades\` sg ON s.idno = sg.student_idno AND sg.edp_code = se.edp_code
        WHERE se.edp_code = ?
    `;
	const db = new sqlite.Database(config.sqlitedb);

	db.all(sql, [edpcode], (err, rows) => {
		if (err) {
			console.error("Error fetching students for subject with grades:", err);
			db.close();
			return res.status(500).json({ message: 'Database error during fetch.', error: err.message });
		}
		db.close();
		return res.status(200).json(rows);
	});
});

module.exports = router;
