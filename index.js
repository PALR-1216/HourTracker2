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
import { render } from 'ejs';

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



app.get('/', (req, res) => {
  // res.render('Login');

  if(req.cookies.user_id) {

  }

  else{
    res.render("Login")
  }
});


app.post('/LoginAuth', (req,res) =>{

})



app.get('/signUp', (req,res) =>{
  res.render('SignUp')

  let dateObj = new Date();
  let year = dateObj.getFullYear().toString().slice(-2)
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let date = ("0" + dateObj.getDate()).slice(-2);
  let AllDate = year + "/" + month + "/" + date
})



app.listen(3000, () => {
  console.log('server running in port 3000');
});
