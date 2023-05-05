import express from 'express';
const app = express();
import mysql from 'mysql';
import session from 'cookie-session';
import bodyParser from 'body-parser';
import path from 'path';
import bcryptjs from 'bcryptjs';
import cookieParser from 'cookie-parser';
import Jsontoken from 'jsonwebtoken';
import cookie from 'cookie-session';
import { nanoid } from 'nanoid'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile, JSONFileSync } from 'lowdb/node'
//https://stackoverflow.com/questions/18441698/getting-time-difference-between-two-times-in-javascript


const db = new Low(new JSONFileSync('db.json'), {Users:[]})
await db.read()
// await db.write();


app.set('trust proxy', 1);
app.set('views', path.join("views"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))

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
    res.render("DashBoard")

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


app.post('/SignUpAuth', (req,res) =>{

  let dateObj = new Date();
  let year = dateObj.getFullYear().toString().slice(-2)
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let date = ("0" + dateObj.getDate()).slice(-2);
  let AllDate = year + "/" + month + "/" + date

  

  let userObject = {
    userID:nanoid(),
    userName:req.body.userName,
    Email:req.body.Email,
    usersWage:Number(req.body.Wage)

  }


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
