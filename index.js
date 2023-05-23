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
// import sharp from 'sharp';
// import sharp from 'sharp'
//https://stackoverflow.com/questions/18441698/getting-time-difference-between-two-times-in-javascript
//https://dev.to/arbaoui_mehdi/how-to-access-the-mysql-cli-with-mamp-25m
//Connect to database with MAMP on cli with /Applications/MAMP/Library/bin/mysql -uroot -p

//https://geekflare.com/nodejs-hosting-platform/#:~:text=12%20Best%20Hosting%20Platform%20for%20Node.js%20Application%201,Platform.sh%20...%207%20NodeChef%20...%208%20Azure%20
//Back up code for stripe = ewoc-pslh-oftc-wyog-ecxz

// const db = new Low(new JSONFileSync('db.json'), {Users:[]})
// await db.read()
// await db.write();


app.set('trust proxy', 1);
app.set('views', path.join("views"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))


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
    else{

      
    console.log("database connected");

    }

  })



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




app.get('/', (req, res) => {
  // res.render('Login');
  if(req.cookies.user_id == null) {
    res.redirect('/LandingPage')
  }

  
  else if(req.cookies.user_id) {
    // res.json(req.cookies.user_id)
    try {
      // let sql = `select User_Name, User_email, Users_ProfileImage from Users where User_id = '${req.cookies.user_id}'`;

        res.render('test1')
      
    } catch (error) {
      console.log("error")
    }
  }

  else{
    res.render('Login')
  }
});

app.get('/Login',(req,res) =>{
  res.render("Login")
})

//show The Landing page

app.get('/LandingPage', (req,res) =>{
  res.render("LandingPage")
  // res.render('LandingPageTest3')
  // res.render('LandingPage2')
})




app.post('/LoginAuth', (req,res) =>{
  let name = req.body.userName;
  let pass = req.body.password;
  
  let checkUser = `select User_id, Users_Password from users where User_Name ='${name}'`;
  conn.query(checkUser, (err,rows) =>{
    if(err) throw err;

    if(rows.length > 0){
      let hash = rows[0].Users_Password;
      bcryptjs.compare(pass, hash, (err,result) =>{
        if(result) {
          res.cookie("user_id", rows[0].User_id);
          res.redirect('/')

        }
        else{
          res.send("<script>alert(`UserName or password are incorrect`); window.location=`/Login`;</script>")
        }
      })
    }
    else{
      res.send("<script>alert(`UserName or password are incorrect`); window.location=`/Login`;</script>")
    }
  })

  // if(name == "senpai" && pass == "senpai") {
  //   res.cookie("user_id", nanoid());
  //   res.redirect('/')

  // }

  // else{
  //   res.redirect('/')
  // }
})



app.get('/signUp', (req,res) =>{
  res.render('SignUp')
})


app.post('/SignUpAuth', Uploader.single("profilePic"), async(req,res) =>{
  let image;

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
    userDateOfCheck: req.body.DateOfCheck,
    userPaymentRate: null,

  }

  // if(req.file !== undefined) {
  
  //   let buffer = req.file.buffer;
  //   // console.log(buffer.toString('base64'))

  //   sharp(buffer).resize(200).jpeg({quality:100}).toBuffer((err,data,info) =>{
  //         image = Buffer.from(data).toString('base64');  
  //         console.log(Buffer.from(data).toString('base64'));
  //   })
  // }

 

  if(req.body.OvertimeType == "Half") {
    userObject.OvertimeType = Number(0.5);
    // res.json("half")
  }

  else if(req.body.OvertimeType == "Double") {
    userObject.OvertimeType = Number(2)
    // res.json("double")
  }

  if(req.body.PaymentRate == "Weekly") {
    userObject.userPaymentRate = "Weekly";
  }

  else if(req.body.PaymentRate == "Biweekly") {
    userObject.userPaymentRate = "Biweekly";
  }

	else{
		userObject.userPaymentRate = "Monthly"
	}

 
  let CheckUserName = `select * from Users where User_Email = '${userObject.Email}' or User_Name ='${userObject.userName}'`;
  conn.query(CheckUserName, (err,rows) =>{
    if(rows.length > 0) {
      res.send("<script>alert(`UserName or Email already exist`);  javascript:history.go(-1);</script>");
    }
    else{
       // res.json(userObject)
        bcryptjs.genSalt(5, (err,salt) =>{
          bcryptjs.hash(userObject.usersPassword, salt, (err,hash) =>{
            let weekDate = req.body.DateOfCheck;
            let sql = `insert into Users Values ('${userObject.userID}','${userObject.userName}', '${userObject.Email}', ${userObject.usersWage}, ${userObject.usersDeduction}, '${userObject.OvertimeType}', '${userObject.userPaymentRate}', '${hash}', '${AllDate}');`;
            

            conn.query(sql, (err,rows) =>{
              if(err) {throw err.message};
              console.log(rows)        
              
              
            })
            res.redirect('/')
          })
          
        })

      }

  })


 

  

  // conn.query(sql)

})

app.get("/feedBack", (req,res) =>{
  res.render("FeedBackPage")
})

app.get("/AboutMe", (req,res) =>{
  res.render("AboutMe")
})

// app.get('/RemoveAds', (req,res) =>{
//   res.render("RemoveAds")
// })



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


app.get('/DeleteAccount', (req,res) =>{

  if(req.cookies.user_id != null) {
    res.render("DeleteAccount")
  }

  else {
    res.redirect('/')
  }
})

app.post('/DeleteAccount',(req,res) =>{
  if(req.body.password != null) {

    let sql = `delete from Users where User_id = "${req.cookies.user_id}";`
    
    conn.query(sql,(err,rows) =>{
      if(err) throw err;

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
  }
})



// -------ADMIN---------

app.get('/api/:Admin', (req,res) =>{
  if(req.params.Admin === "Senpai") {
      conn.query('select * from Users', (err,rows) =>{
        if(err) throw err;
    
        res.json(rows)
      })
  }
  else{
    res.redirect('/')

    

  }

  
})


app.get('*', (req, res) => {
  res.status(404).render('404')
});


app.listen(3000, () => {
  console.log('server running in port 3000');
});

