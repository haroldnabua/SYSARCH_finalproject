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
			return res.status(500).json(err);
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
			res.status(500).json(err);
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
			return res.status(500).json(err);
		}
		db.close();
		return res.status(200).json({message:'Course Deleted'});
	})
});


router.get("/:courseid",(req,res)=>{
	let courseid = req.params.courseid;
	let sql = "SELECT * FROM `"+table+"` WHERE `courseid`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.get(sql,courseid,(err,row)=>{
		if(err){
			console.log("error :"+err);
			db.close();
			return res.status(500).json(err);
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
			res.status(500).json(err);
		}
		else{
			db.close();
			res.status(200).json({message:'Course Updated'});
		}
	});
});

router.post("/enroll",(req,res)=>{
	const { studentIdno, edpcode } = req.body;
	console.log(`Enrollment request for Student ID: ${studentIdno} in EDP Code: ${edpcode}`);
	// In a real application, you would insert this into a "student_enrollments" table
	// For now, it's a placeholder.
	res.status(200).json({ message: 'Enrollment successful (simulated)' });
});

module.exports = router;
