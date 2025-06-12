const express = require("express");
const config = require("./config");
const students = require("./api/students");
const courses = require("./api/courses");
const path = require('path');
const axios = require('axios');

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

app.get('/subject', (req, res) => {
  res.render('subject');
});

const server = app.listen(port,()=>{
	console.log(`listening at port : ${port}`);
});