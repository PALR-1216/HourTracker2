import express from 'express';
const app = express();
import mysql from 'mysql';
import session from 'cookie-session';
import bodyParser from 'body-parser';
import path, { basename } from 'path';
import bcryptjs from 'bcryptjs';
import cookieParser from 'cookie-parser';
import Jsontoken from 'jsonwebtoken';
import cookie from 'cookie-session';
import { nanoid } from 'nanoid'
import multer from 'multer'

//https://stackoverflow.com/questions/18441698/getting-time-difference-between-two-times-in-javascript


// const db = new Low(new JSONFileSync('db.json'), {Users:[]})
// await db.read()
// await db.write();


app.set('trust proxy', 1);
app.set('views', path.join("views"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

function connectDB() {

    let conn = mysql.createConnection({
      host:"localhost",
      user:"root",
      password:"root",
      database:"HourTracker2",
      port:8889
  })

  conn.connect((err) => {
    if (err) {
        console.log(err.message)
    }

    console.log("database connected");
  })

}




const Uploader = multer({storage:multer.memoryStorage()});

//make a login System in node with sessions and mysql 
app.use(cookieParser());
app.use(express.json());

app.use(session({
    cookie: {
        secure: true,
        maxAge: 21600000

    },
    secret: 'user_sid',
    resave: true,
    saveUninitialized: true,

}))




app.get('/', async(req, res) => {
  // res.render('Login');
  
  if(req.cookies.user_id) {
    // res.render("DashBoard")
    res.render('test1')

  }

  else{
    res.render("Login")
  }
});


app.post('/LoginAuth', (req,res) =>{
  let name = req.body.userName;
  let pass = req.body.password;

  if(name == "senpai" && pass == "senpai") {
    res.cookie("user_id", nanoid());
    res.redirect('/')

  }

  else{
    res.redirect('/')
  }
})



app.get('/signUp', (req,res) =>{
  res.render('SignUp')
})


app.post('/SignUpAuth', Uploader.single("profilePic"), (req,res) =>{

  let dateObj = new Date();
  let year = dateObj.getFullYear().toString().slice(-2)
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let date = ("0" + dateObj.getDate()).slice(-2);
  let AllDate = year + "/" + month + "/" + date

  

  let userObject = {
    userID:nanoid(),
    dateAdded:AllDate,
    userName:req.body.userName,
    Email:req.body.Email,
    usersWage:Number(req.body.Wage),
    usersDeduction:Number(req.body.Deduction) / 100,
    usersPassword:req.body.Password,
    OvertimeType:null,
    // userProfilePic: req.file.buffer.toString('base64') || null
    userProfilePic:null
  }

 

  if(req.body.OvertimeType == "Half") {
    userObject.OvertimeType = Number(0.5);
    // res.json("half")
  }

  else if(req.body.OvertimeType == "Double") {
    userObject.OvertimeType = Number(2)
    // res.json("double")
  }


  res.json(userObject)
})


app.post('/calculateHours', (req,res) =>{
    let checkIn = req.body.checkIn;
    let clockOut = req.body.clockOut;

    let obj = {
      enter: checkIn,
      out: clockOut,
      startBreak: '',
      endBreak: '',
    };

    if (req.body.startBreak && req.body.endBreak) {
      obj.startBreak = req.body.startBreak;
      obj.endBreak = req.body.endBreak;
    }

    res.json(obj);
})



app.get('/logout', (req, res, next) => {

  // req.session.destroy();

  let cookie = req.cookies;
  for (var prop in cookie) {
      if (!cookie.hasOwnProperty(prop)) {
          continue;
      }
      res.cookie(prop, '', {
          expires: new Date(0)
      });
  }
  res.redirect('/');
})


app.listen(3000, () => {
  console.log('server running in port 3000');
});
