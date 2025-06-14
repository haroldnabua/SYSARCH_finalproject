const express = require("express");
const config = require("./config");
const students = require("./api/students");
const courses = require("./api/courses");
const path = require('path');
const axios = require('axios');
const sqlite = require('sqlite3');

const port = config.port || 4321;

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use("/api/students",students);
app.use("/api/courses",courses);


app.get("/",(req,res)=>{
	return res.send("hello world");
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email, password);
  if (email === 'admin@email.com' && password === '123') {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/dashboard', async (req, res) => {
  // Fetch students from your database here
  try {
    const response = await axios.get(`http://localhost:${port}/api/students`);
    const students = response.data;
    res.render('dashboard', { students });
  } catch (err) {
    res.render('dashboard', { students: [] });
  }
});

app.post('/dashboard', async (req, res) => {
  // Add a new student to the database
  try {
    const response = await axios.post(`http://localhost:${port}/api/students`, req.body);
    if (response.status === 200) {
      res.redirect('/dashboard');
    } else {
      res.status(500).send('Failed to add student');
    }
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).send('Failed to add student');
  }
});

app.get('/subject', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${port}/api/courses`);
    const subjects = response.data;
    console.log("Subjects fetched for subject.ejs:", subjects);
    res.render('subject', { subjects });
  } catch (err) {
    console.error("Error fetching subjects for subject.ejs:", err);
    res.render('subject', { subjects: [] });
  }
});

app.get('/enrollment', async (req, res) => {
  const subject = {
    edpcode: req.query.edpcode,
    subcode: req.query.subcode,
    descriptivetitle: req.query.description,
    schedule: req.query.schedule,
    room: req.query.room,
    units: req.query.units
  };
  try {
    // Assuming an API endpoint to fetch students by EDP code
    const response = await axios.get(`http://localhost:${port}/api/courses/${subject.edpcode}/students`);
    const students = response.data;
    res.render('enrollment', { subject, students });
  } catch (err) {
    console.error("Error fetching students for enrollment:", err);
    res.render('enrollment', { subject, students: [] }); // Pass an empty array if there's an error
  }
});

const server = app.listen(port,()=>{
	console.log(`listening at port : ${port}`);

    const db = new sqlite.Database(config.sqlitedb);
    db.run(`
        CREATE TABLE IF NOT EXISTS student_enrollments (
            student_idno VARCHAR(10) NOT NULL,
            edp_code INTEGER NOT NULL,
            PRIMARY KEY (student_idno, edp_code),
            FOREIGN KEY (student_idno) REFERENCES students(idno) ON DELETE CASCADE,
            FOREIGN KEY (edp_code) REFERENCES courses(edpcode) ON DELETE CASCADE
        );
    `, (err) => {
        if (err) {
            console.error("Error creating student_enrollments table:", err.message);
        } else {
            console.log("student_enrollments table ensured.");
        }
        db.close();
    });
});