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
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import cron from 'node-cron'
import nodemailer from 'nodemailer'
import moment from 'moment';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// import env from 'dotenv'
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
app.use(bodyParser.json())



//   let conn = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"root",
//     database:"HourTracker2",
//     port:8889
// })

let conn = mysql.createConnection({
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
})

conn.connect((err) => {
  if (err) {
    console.log(err.message)
  }
  else {


    console.log("database connected");

  }

})

// const Uploader = multer({storage:multer.memoryStorage()});

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




//TODO: Fix this area 
cron.schedule("*/15 * * * * *", () =>{
  let sql = "select User_id, User_EndPeriodDate, User_PayOut, Payment from Users;"
  let currentDate = moment();
  conn.query(sql,(err,rows) =>{
    for(let i in rows) {
      let periodDate = moment(rows[i].User_EndPeriodDate);
      let payOutDates = moment(rows[i].User_PayOut);
      let payment = rows[i].Payment;
      console.log(payment)
      let days_left = Math.ceil(payOutDates.diff(currentDate, "days", true))
      let ID = rows[i].User_id;

      if(days_left === 0) {
        console.log(`today is the pay out ${days_left} for user - ${ID}`)
        if(payment === "Biweekly") {
          let nextPayOut = moment(currentDate.add(14, "days", true))

          let sql = `update Users set DaysLeftToPayOut=${days_left} where User_id = '${ID}'`
        }

        else if(payment === "Weekly") {
          let nextPayOut = moment(currentDate.add(7, "days", true))

        }

        else if(payment === "Monthly") { 
          let nextPayOut = moment(currentDate.add(30, "days", true))

        }
       
        getUserTotalPay(ID)

      }

      if (days_left > 0) {
        console.log(`days left ${days_left} for user - ${ID}`)
        console.log(payOutDates)
        let sql = `update Users set DaysLeftToPayOut=${days_left} where User_id = '${ID}'`
        conn.query(sql,(err,rows) =>{
          if(err) throw err

        })
      }

    }
  })
})


function getUserTotalPay(ID) {
  let sql = `select * from Hours where UserID = '${ID}'`;
  conn.query(sql, (err,rows) =>{
    if(err) throw err;

    console.log(rows)
  })
}

app.get('/', (req, res) => {

  // res.render('Login');
  if (req.cookies.user_id == null) {
    res.redirect('/LandingPage')
  }


  else if (req.cookies.user_id) {
    // res.json(req.cookies.user_id)
    try {
      // let sql = `select User_Name, User_email, Users_ProfileImage from Users where User_id = '${req.cookies.user_id}'`;
      let Hours = `select * from Hours where UserID = '${req.cookies.user_id}'`
      conn.query(Hours, (err,rows) =>{
        if(err) throw err;
        res.render("Home", {Hours:rows})

      })

      // res.render('Home')

    } catch (error) {
      console.log("error")
    }
  }

  else {
    res.render('Login')
  }
});

app.get('/Login', (req, res) => {

  if (req.cookies.user_id) {
    res.render('Home');

  }

  else {
    res.render("Login")
  }
})

//show The Landing page

app.get('/LandingPage', (req, res) => {
  res.render("LandingPage")
  // res.render('LandingPageTest3')
  // res.render('LandingPage2')
})




app.post('/LoginAuth', (req, res) => {
  let name = req.body.userName;
  let pass = req.body.password;

  let checkUser = `select User_id, Users_Password from Users where User_Name ='${name}'`;
  conn.query(checkUser, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      let hash = rows[0].Users_Password;
      bcryptjs.compare(pass, hash, (err, result) => {
        if (result) {
          res.cookie("user_id", rows[0].User_id);
          res.redirect('/')

        }
        else {
          res.send("<script>alert(`UserName or password are incorrect`); window.location=`/Login`;</script>")
        }
      })
    }
    else {
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



app.get('/signUp', (req, res) => {
  res.render('SignUp')
})


app.post('/SignUpAuth', (req, res) => {

  let dateObj = new Date();
  let year = dateObj.getFullYear().toString().slice(-2)
  let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  let date = ("0" + dateObj.getDate()).slice(-2);
  let AllDate = year + "/" + month + "/" + date



  // let userObject = {
  //   userID:nanoid(),
  //   dateAdded:AllDate,
  //   userName:req.body.userName,
  //   Email:req.body.Email,
  //   usersWage:Number(req.body.Wage),
  //   usersDeduction:Number(req.body.Deduction) / 100,
  //   usersPassword:req.body.Password,
  //   OvertimeType:null,
  //   userDateOfCheck: req.body.DateOfCheck,
  //   userPaymentRate: null,

  // }






  let CheckUserName = `select * from Users where User_Email = '${req.body.Email}' or User_Name ='${req.body.userName}'`;
  conn.query(CheckUserName, (error, rows) => {
    // if(err) {throw err.message}
    if (rows.length > 0) {
      res.send("<script>alert(`UserName or Email already exist`);  javascript:history.go(-1);</script>");
    }
    else {
      bcryptjs.genSalt(5, (err, salt) => {
        bcryptjs.hash(req.body.Password, salt, (err, hash) => {
          // if(err) {throw err.message}
          let weekDate = req.body.EndPeriodDate;
          let OvertimeType;
          if (req.body.OvertimeType == "Half") {
            OvertimeType = 0.5;
          }

          // else if(req.body.OvertimeType == "Double") {
          //   OvertimeType = 2;
          // }

          else {
            OvertimeType = 2
          }


          let sql = `insert into Users Values ('${nanoid()}','${req.body.userName}', '${req.body.Email}', ${Number(req.body.Wage)}, ${Number(req.body.Deduction) / 100}, ${OvertimeType}, '${req.body.DatePickerEnd}', '${hash}', '${AllDate}', '${req.body.PaymentRate}', '${req.body.payOut}'});`;
          conn.query(sql, (errorInAccount, rows) => {
            if (errorInAccount) {
              res.json("An error occured please try again")
            }
            console.log(rows)


          })
          res.redirect('/AccountCreated')
        })

      })

    }

  })




  app.get("/CheckDates", (req,res) =>{


  })


  // conn.query(sql)

})

app.get("/feedBack", (req, res) => {
  res.render("FeedBackPage");



})

app.post('/SendFeedBack', (req, res) => {

  let sql = `insert into FeedBack (Name, Email, Message) values ('${req.body.Name}', '${req.body.Email}', '${req.body.Message}');`;
  conn.query(sql, (err, rows) => {
    if (err) { throw err }
    console.log(rows)
  })

})

app.get("/AboutMe", (req, res) => {
  res.render("AboutMe")

})

// app.get('/RemoveAds', (req,res) =>{
//   res.render("RemoveAds")
// })

app.get('/AccountCreated', (req, res) => {
  res.render("PopUps/AccountCreated")
})

app.get('/Account', (req, res) => {
  res.render('PopUps/ThankYouFeedBack')
})


app.get('/addHour', (req, res) => {
  if (req.cookies.user_id == null) {
    res.redirect('/')
  }
  else {
    res.render('AddData')
  }
})




app.post('/calculateHour', (req, res) => {
  let user = `select User_wage from Users where User_id = '${req.cookies.user_id}';`;
  conn.query(user, (err, rows) => {
    if (err) { throw err }
    let wage = rows[0].User_wage

    // const options = { hour12: true, hour: 'numeric' };
    const options = { hour12: true, hour: '2-digit', minute: '2-digit' };

    let checkIn = new Date(req.body.startTime);
    let clockOut = new Date(req.body.endTime);
    let startOfBreak = new Date(req.body.startBreak) || null;
    let endOfBreak = new Date(req.body.endBreak) || null
    //call function for timepunch

    if (startOfBreak != null && endOfBreak != null) {

      const breakMiliseconds = Math.abs(endOfBreak - startOfBreak);
      let totalBreakTime = breakMiliseconds / 36e5;
      const milliseconds = Math.abs(clockOut - checkIn);
      const hours = milliseconds / 36e5;

      //get Date of the input
      let year = checkIn.getFullYear().toString().slice(-2);
      let month = ('0' + (checkIn.getMonth() + 1)).slice(-2);
      let date = ('0' + checkIn.getDate()).slice(-2);
      let AllDate = year + '/' + month + '/' + date;

      let hour1 = checkIn.toLocaleTimeString('en-US', options);
      let hour2 = clockOut.toLocaleTimeString('en-US', options);
      let break1 = startOfBreak.toLocaleTimeString('en-US', options) || null
      let break2 = endOfBreak.toLocaleTimeString('en-US', options) || null
     
      // res.json({
      //   start: hour1,
      //   end: hour2,
      //   totalHours: hours,
      //   break:totalBreakTime || "No Break"
      // })

      let Success = `
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

        </head>

        <body>

            <div class="container d-flex align-items-center justify-content-center">
        
        <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_atippmse.json" background="transparent" speed="1"  style="height: 600px;" autoplay></lottie-player>
       
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>

    <script> 
    setInterval(() =>{
      window.location = "/"

    },2250)
        
    
    </script>

</body>

        </html>
        `




      if (break1 === "Invalid Date" || break2 === "Invalid Date") {
        let totalMoney = hours * wage;
        let sql = `insert into Hours values ('${nanoid()}', '${req.cookies.user_id}', '${hour1}', '${hour2}', ${hours}, ${null}, ${null}, ${null}, ${hours * wage}, '${AllDate}')`
        conn.commit(sql);
        // res.redirect('/DataSubmited')
        

        res.send(Success);

      } else {
        let sql = `insert into Hours values ('${nanoid()}', '${req.cookies.user_id}', '${hour1}', '${hour2}', ${hours}, '${break1}', '${break2}', ${totalBreakTime}, ${(hours - totalBreakTime).toFixed(2) * wage}, '${AllDate}')`
        conn.commit(sql)
        // res.redirect('/DataSubmited')
        res.send(Success)

      }
    }
  })
})


// app.get('/DataSubmited', (req,res) =>{
//   res.render("PopUps/DataAdded");
// })



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


app.get('/DeleteAccount', (req, res) => {

  if (req.cookies.user_id != null) {
    res.render("DeleteAccount")
  }

  else {
    res.redirect('/')
  }
})

app.post('/DeleteAccount', (req, res) => {
  if (req.body.password != null) {

    let sql = `delete from Users where User_id = "${req.cookies.user_id}";`

    conn.query(sql, (err, rows) => {
      if (err) throw err;

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

app.get('/api/:Admin', (req, res) => {
  if (req.params.Admin === "Senpai") {
    conn.query('select * from Users', (err, rows) => {
      if (err) throw err;

      res.json(rows)
    })
  }
  else {
    res.redirect('/')




  }
})

app.get('/api/:Admin/getusers', (req, res) => {
  //get a list of users of my page
  
})


//Login via IOS POST
app.post('/Apilogin', (req, res) => {
  let userName = req.body.userName
  let password = req.body.password;


  if (!userName) {
      res.json({
          Message: "Enter username"
      })

  } else if (!password) {
      res.json({
          Message: "Enter password"
      })

  } else {
      //check if user exist
      let sql = `select * from Users where User_Name='${userName}'`
      conn.query(sql, async (err, rows) => {
          if (rows.length == 0) {
              res.json({
                  Message: "Error in finding users",
                  Success: "False"
              })
          }

          if (err) {
              res.json({
                  Message: "Error in finding users",
                  Success: "False"
              })
          } else {

              try {

                  //hashCompare the password to the one in the database
                  const passwordIsFound = await bcrypt.compare(password, rows[0].Users_Password)
                  if (!passwordIsFound) {
                      //user is not found 
                      res.json({
                          Message: "Password does not match the database",
                          Success: "False"
                      })
                      return
                  } else {
                      let obj;
                      let token;
                      var totalHours;
                      let totalMoney;
                      var totalNET;
                      let wage = rows[0].usersWage;
                      let deduction = rows[0].usersDeduction
                      let id = rows[0].userId;


                      // let sql = `select * from hours where userId = ${rows[0].userId}`
                      // let sqlTotalHours = `select Format(SUM(totalHour),2) as SumHours from hours where userId=${id};`;
                      // conn.query(sqlTotalHours, (err, totalHours) => {
                      //     totalHours = totalHours[0].SumHours;
                      //     let totalEarned = totalHours * wage
                      //     totalNET = totalEarned - (totalEarned * deduction)


                          // for (let i in rows) {
                          //     obj = {
                          //         Success: "True",
                          //         TotalHours: totalHours,
                          //         TotalEarned: totalNET,
                          //         Token: Jsontoken.sign({
                          //             userId: rows[0].userId,
                          //             userName: rows[0].userName
                          //         }, "userData"),
                          //         userId: rows[0].userId,
                          //         userName: rows[0].userName,
                          //         usersWage: rows[0].usersWage,
                          //         usersDeduction: rows[0].usersDeduction,
                          //         userEmail: rows[0].userEmail,
                          //         usersOvertime: rows[0].usersOvertime,
                          //         DateAdded: rows[0].DateAdded,
                          //         userPassword: rows[0].userPassword
                          //     }
                          // }
                          // res.json(obj)
                          // console.log(obj)

                      // })
                  }

              } catch (error) {
                  console.log(error)

              }
          }
      })
  }
})



app.get('*', (req, res) => {
  res.status(404).render('404')
});




//function so the server doesent go to sleep
setInterval(function () {
  conn.query('SELECT 1');
}, 5000);


const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log('server running in port 3000');
});




