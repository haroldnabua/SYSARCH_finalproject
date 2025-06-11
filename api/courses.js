//students restfull api
const express = require("express");
const sqlite = require("sqlite3");
const config = require("../config");
const router = express.Router();

const table = "courses";

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

router.delete("/:courseid",(req,res)=>{
	let idno = req.params.idno;
	let sql = "DELETE FROM `"+table+"` WHERE `courseid`=?";
	const db = new sqlite.Database(config.sqlitedb);
	console.log(sql);
	db.run(sql,idno,(err)=>{
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
	let fld_data = [];
	let body = req.body;
	let keys = Object.keys(body);
	let values = Object.values(body);
	for(let i=1;i<values.length;i++){
		fld_data.push("`"+keys[i]+"`='"+values[i]+"'");
	}
	//join fld_data as 1 string with command delimiter
	let fld = fld_data.join(',');
	let sql = "UPDATE `"+table+"` SET "+fld+" WHERE `"+keys[0]+"`='"+values[0]+"'";
	//console.log(sql);
	const db = new sqlite.Database(config.sqlitedb);
	db.run(sql,(err)=>{
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


module.exports = router;
