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
			return res.status(500).json(err);
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
			return res.status(500).json(err);
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
			return res.status(500).json(err);
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
			return res.status(500).json(err);
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
			res.status(500).json(err);
		}
		else{
			db.close();
			res.status(200).json({message:'Student Updated'});
		}
	});
});


module.exports = router;
