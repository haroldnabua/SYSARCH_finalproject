const express = require("express");
const config = require("./config");
const students = require("./api/students");
const courses = require("./api/courses");
const path = require('path');

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

app.get('/dashboard', (req, res) => {
  // Fetch students from your database here
  const students = [
    { idno: 1000, lastname: 'durano', firstname: 'dennis', course: 'bscpe', level: 4 }
    // ... more students
  ];
  res.render('dashboard', { students });
});

app.get('/subject', (req, res) => {
  res.render('subject');
});

const server = app.listen(port,()=>{
	console.log(`listening at port : ${port}`);
});