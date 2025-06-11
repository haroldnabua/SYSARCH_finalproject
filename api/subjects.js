//subjects restful api
const express = require("express");
const sqlite = require("sqlite3");
const config = require("../config");
const router = express.Router();

const table = "subjects";

// Get all subjects
router.get("/", (req, res) => {
  const sql = `SELECT * FROM \`${table}\``;
  const db = new sqlite.Database(config.sqlitedb);
  db.all(sql, (err, rows) => {
    db.close();
    if (err) return res.status(500).json(err);
    return res.status(200).json(rows);
  });
});

// Get a subject by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM \`${table}\` WHERE id = ?`;
  const db = new sqlite.Database(config.sqlitedb);
  db.get(sql, [id], (err, row) => {
    db.close();
    if (err) return res.status(500).json(err);
    return res.status(200).json(row);
  });
});

// Add a new subject
router.post("/", (req, res) => {
  const body = req.body;
  const keys = Object.keys(body);
  const values = Object.values(body);
  const qmarks = keys.map(() => '?').join(',');
  const fields = keys.join('`,`');
  const sql = `INSERT INTO \`${table}\`(\`${fields}\`) VALUES(${qmarks})`;
  const db = new sqlite.Database(config.sqlitedb);
  db.run(sql, values, function(err) {
    db.close();
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: 'Subject Added', id: this.lastID });
  });
});

// Update a subject
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const keys = Object.keys(body);
  const values = Object.values(body);
  const setStr = keys.map(key => `\`${key}\` = ?`).join(', ');
  const sql = `UPDATE \`${table}\` SET ${setStr} WHERE id = ?`;
  const db = new sqlite.Database(config.sqlitedb);
  db.run(sql, [...values, id], function(err) {
    db.close();
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: 'Subject Updated' });
  });
});

// Delete a subject
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM \`${table}\` WHERE id = ?`;
  const db = new sqlite.Database(config.sqlitedb);
  db.run(sql, [id], function(err) {
    db.close();
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: 'Subject Deleted' });
  });
});

module.exports = router; 