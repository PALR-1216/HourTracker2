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
import cookieSession from 'cookie-session';
import { userInfo } from 'os';
import device from 'express-device'
import zone from 'moment-timezone';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
//https://stackoverflow.com/question/1754411/how-to-select-date-from-datetime-column
//Link for the dates

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

app.use(device.capture());

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

app.get('/checkUserPayOut', async (req, res) => {

  const puertoRicoTimezone = 'America/Puerto_Rico';

  // Get the current time in Puerto Rico's timezone
  const currentTimeInPuertoRico = moment().tz(puertoRicoTimezone);
  
  // console.log(currentTimeInPuertoRico);
  
    // await getUserInfo(req.cookies.user_id );
    // return res.send('ok')
    //it works need to make the my checkMaker bot inside here
    let selectUser = `select User_id, User_EndPeriodDate from Users`;
     conn.query(selectUser, async (err,users) =>{
  
      if(err) {throw err}
      for(let i in users) {
        let currentDate = moment()
      
        let usersDate = moment(users[i].User_EndPeriodDate)
      
        let userID = users[i].User_id;
        let userNextDate = moment(usersDate).add(1,'days', true)
        // console.log(`first Date - ${currentDate} second ndate - ${userNextDate}`)
        
        let diff = currentTimeInPuertoRico.diff(userNextDate, 'days')
      
        // console.log(`user - ${userID} date - ${userNextDate}`)
        if(diff == 0 ) {
          await GetUserHours(userNextDate, userID)     
        }
      }
  
    })
})  

async function UpdateUsersEndPeriodDate(endDate, ID, daysToAdd) {
  let addDays = moment(endDate).add(daysToAdd, 'days');
  let updateDate = `UPDATE Users SET User_EndPeriodDate = '${addDays.format("YYYY/MM/DD")}' WHERE User_id = '${ID}';`
  // console.log(updateDate)

  // conn.commit(updateDate, (err) =>{
  //   if(err) {
  //     throw err.message

  //   }
  // })


}

async function AddUserPayOutToDB(startDate,endDate, Totals, User_id,payDay, daysToAdd) {
  // console.log(Totals)
  //need to Add date when i receive the check
  //then delete all hours that are before the < next date 

  let obj = {
    startDate: moment(startDate).format("MMM DD"),
    endDate:moment(endDate).format("MMM DD"),
    Totals:Totals,
    PayDay:moment(payDay).format("MMM DD")

  }
  // console.log(obj)
  let insertPayCheck = `insert into PayOuts values ('${nanoid()}', '${User_id}', '${moment(startDate).format("MMM DD")}', '${moment(endDate).format("MMM DD")}', ${Totals[0].TotalEarned}, ${Totals[0].Total}, ${Totals[0].TotalTaxes}, '${moment(payDay).format("MMM DD")}')`
  // console.log(insertPayCheck)
  // conn.commit(insertPayCheck, (err) =>{
  //   if(err) {
  //     throw err
  //   }
  // })

  await UpdateUsersEndPeriodDate(endDate, User_id, daysToAdd);
}

async function CreateUserPayOut(User_id, Totals, endPeriodDate, Payment, payDay) {
  // console.log(endPeriodDate)
  // console.table(Totals)
  let daysToAdd;

  switch(Payment) {
    case "Weekly":
      daysToAdd = 7
      break
    
    case "Biweekly":
      daysToAdd = 14
      break
    
    case "Monthly" :
      daysToAdd = 30
      break
  }

  let endDate = moment(endPeriodDate)
  let startDate = moment(endDate).subtract(daysToAdd, 'days')
  // console.log(startDate)
  await AddUserPayOutToDB(startDate,endDate, Totals, User_id, payDay, daysToAdd)
 
}

async function GetUserHours(userNextDate, User_id) {
  let selectHours = `select * from Hours where UserID = '${User_id}'`;
  conn.query(selectHours, async (err, hours) => {
    if (hours.length != 0) {


      let GetUserDeductions = `select User_deduction, User_EndPeriodDate, Payment, User_PayOut from Users where User_id = '${User_id}';`
      conn.query(GetUserDeductions, async (err, deduction) => {
        if (err) {
          throw err;
        }


        let setAllAmounts = `select SUM(TotalHours) as Total, SUM(TotalEarned) as totalEarned, SUM(TotalEarned * ${deduction[0].User_deduction}) as TotalTaxes from Hours where UserID = '${User_id}'`
        conn.query(setAllAmounts, async (err, Totals) => {
          let arr = []
          // console.log(Totals)
          for (let i in Totals) {
            let obj = {
              Total: Totals[i].Total,
              TotalEarned: Totals[i].totalEarned,
              TotalTaxes: Totals[i].TotalTaxes
            }
            arr.push(obj)
          }

          await CreateUserPayOut(User_id, arr, deduction[0].User_EndPeriodDate, deduction[0].Payment, deduction[0].User_PayOut)


        })
      })
    }
  })
}

//*/5 * * * * *
//0 0 * * *

cron.schedule("/*/5 * * * * *", async() =>{
  const puertoRicoTimezone = 'America/Puerto_Rico';

// Get the current time in Puerto Rico's timezone
const currentTimeInPuertoRico = moment().tz(puertoRicoTimezone);

// console.log(currentTimeInPuertoRico);

  // await getUserInfo(req.cookies.user_id );
  // return res.send('ok')
  //it works need to make the my checkMaker bot inside here
  let selectUser = `select User_id, User_EndPeriodDate from Users`;
   conn.query(selectUser, async (err,users) =>{

    if(err) {throw err}
    for(let i in users) {
      let currentDate = moment()
    
      let usersDate = moment(users[i].User_EndPeriodDate)
    
      let userID = users[i].User_id;
      let userNextDate = moment(usersDate).add(1,'days', true)
      // console.log(`first Date - ${currentDate} second ndate - ${userNextDate}`)
      
      let diff = currentTimeInPuertoRico.diff(userNextDate, 'days')
    
      // console.log(`user - ${userID} date - ${userNextDate}`)
      if(diff == 0 ) {
        await GetUserHours(userNextDate, userID)     
      }
    }

  })
})

cron.schedule("0 0 * * *", () =>{
  let selectUser = `select User_id, User_EndPeriodDate from Users`;

  conn.query(selectUser, (err,rows) =>{

    if(rows.length != 0) {


      if(err) {
        throw err
      };


      for(let i in rows) {
        let ID = rows[i].User_id;
        let User_EndPeriodDate = moment(rows[i].User_EndPeriodDate)
        let getNextDayOfPeriodEnd = User_EndPeriodDate.add(1, 'days', true).format("MM/DD/YYYY")
        console.log(getNextDayOfPeriodEnd)
        let currentDate = moment().format("MM/DD/YYYY")

        if(getNextDayOfPeriodEnd === currentDate) {
          getTotalEarned(ID, User_EndPeriodDate, getNextDayOfPeriodEnd)
          

        }

        else {
          console.log(`Not Today for User - ${ID} the Date - ${getNextDayOfPeriodEnd}`)
        } 
        }
      }
  })
})




function getTotalEarned(ID, EndPeriod,getNextDayOfPeriodEnd) {
  let currentDate = moment();

  let selectUser = `select User_deduction, User_EndPeriodDate, User_PayOut, Payment, AccountCreated from Users where User_id = '${ID}'`
  conn.query(selectUser, (err,rows) =>{
    if(err) throw err;

    if(rows.length != 0) {
      let UserDeduction = rows[0].User_deduction;
      let UserPayOutDate = moment(rows[0].User_PayOut).format("MMM DD")
      let UserPeriodEnd = moment(rows[0].User_EndPeriodDate)

      let makePayPeriod = `select SUM(TotalHours) as Total, SUM(TotalEarned) as totalEarned, SUM(TotalEarned * ${UserDeduction}) as TotalTaxes from Hours where UserID = '${ID}';`
      conn.query(makePayPeriod,(err,PeriodCheck) =>{
        if(err) throw err;

        if(PeriodCheck[0].Total === 0){
          console.log("no Data")
        }

        else{
          let PayOutObj = {
            TotalHours:PeriodCheck[0].Total,
            totalEarned:PeriodCheck[0].totalEarned,
            TotalTaxes:PeriodCheck[0].TotalTaxes,
            DateEnd: UserPeriodEnd.format("MMM DD"),
            NextDayperiodEnd:UserPeriodEnd.add(1,'days', true).format("MMM DD"),
            PaymentType: rows[0].Payment

          }
          


          CreatePayOutPeriodCheck(PeriodCheck[0].Total, PayOutObj.totalEarned, PayOutObj.TotalTaxes, PayOutObj.DateEnd,PayOutObj.NextDayperiodEnd, ID, UserPayOutDate,rows[0].Payment , PeriodCheck[0].AccountCreated, getNextDayOfPeriodEnd);
          //TODO: Insert into PayOut a new PayPeriod
          //TODO: 1, call a function to insert PayOut
          //TODO: 2, call a function to update the users PayPeriod End


        }
      })
    }
  })
}

function CreatePayOutPeriodCheck(Hours, Money, Taxes, DateEnd, NextDayPeriod, UserID, UserPayOutDate, PaymentType, AccountCreated, getNextDayOfPeriodEnd) {

  //NEED to check if Date is greater than AccountDate if is greater then just put the account Date as the Firsdt Date
  //check diference in time is the current dat enad the date created
 
  
  if(PaymentType === "Biweekly") {
    console.log(PaymentType)

    
    let CheckAccountCreated = moment(AccountCreated)
    // console.log(CheckAccountCreated)
    let FirstDate = moment(NextDayPeriod).subtract(14, 'days', true).format("MMM DD")

    let insertIntoPayOut = `insert into PayOuts values ('${nanoid()}', '${UserID}', '${FirstDate}',  '${DateEnd}', ${Money}, ${Hours}, ${Taxes}, '${UserPayOutDate}', ${0})`
    // conn.commit(insertIntoPayOut)
    conn.query(insertIntoPayOut, (err) =>{
      if(err) {
        console.log("error inserting PayOut")
        throw err;
      }
    })
    // console.log(insertIntoPayOut)
    DeleteAllHoursFromPayPeriod(UserID, getNextDayOfPeriodEnd)
    
  }

  else if(PaymentType === "Weekly") {
    console.log(PaymentType)
    let FirstDate = moment(NextDayPeriod).subtract(7, 'days', true).format("MMM DD")
    let insertIntoPayOut = `insert into PayOuts values ('${nanoid()}', '${UserID}', '${FirstDate}',  '${DateEnd}', ${Money}, ${Hours}, ${Taxes}, '${UserPayOutDate}', ${0})`
    conn.query(insertIntoPayOut, (err) =>{
      if(err) {
        console.log("error inserting PayOut")
        throw err;
      }
    })
    // console.log(insertIntoPayOut)
    DeleteAllHoursFromPayPeriod(UserID, getNextDayOfPeriodEnd)
  }

  else if(PaymentType === "Monthly") {
    console.log(PaymentType)
    let FirstDate = moment(NextDayPeriod).subtract(30, 'days', true).format("MMM DD")
    let insertIntoPayOut = `insert into PayOuts values ('${nanoid()}', '${UserID}', '${FirstDate}',  '${DateEnd}', ${Money}, ${Hours}, ${Taxes}, '${UserPayOutDate}', ${0})`
    conn.query(insertIntoPayOut, (err) =>{
      if(err) {
        console.log("error inserting PayOut")
        throw err;
      }
    })
    // console.log(insertIntoPayOut)
    DeleteAllHoursFromPayPeriod(UserID, getNextDayOfPeriodEnd)

  }

  //add The Data to the Database
  //Now Delete al the hours from that payDate 
}

function DeleteAllHoursFromPayPeriod(UserID, getNextDayOfPeriodEnd) {
  let currentDate = moment();
  console.log(getNextDayOfPeriodEnd)
  //still needs work
  let sqlDelete = `delete from Hours where UserID = '${UserID}' and Date < '${getNextDayOfPeriodEnd}';`
  console.log(sqlDelete)

  conn.query(sqlDelete,(rows,err) =>{
    try {
      UpdateNextPeriodDate(UserID);
      
    } catch (error) {
      if(err) throw err
      console.log("error")
      
    }
   

    // console.log(rows)
  })

  // UpdateNextPeriodDate(UserID);
}


function UpdateNextPeriodDate(ID) {

  let user =`select User_EndPeriodDate, Payment from Users where User_id = '${ID}'`
  conn.query(user,(err,rows) =>{
    if(err) throw err
    let Date = moment(rows[0].User_EndPeriodDate)
    let PaymentType = rows[0].Payment;

    if(PaymentType === "Weekly") {
        let nextDate = moment(Date.add(7,'days', true)).format("MM/DD/YY")
        console.log(nextDate)
        let commit = `update Users set User_EndPeriodDate = '${nextDate}' where User_id ='${ID}'; `
        conn.query(commit,(err) =>{
          if(err) {
            console.log("error in updating date")
            throw err;
          }
        })
        console.log("Weekly")

    }

    else if (PaymentType === "Biweekly"){
        let nextDate = moment(Date.add(14,'days', true)).format("MM/DD/YY")
        console.log(nextDate)
        let commit = `update Users set User_EndPeriodDate = '${nextDate}' where User_id ='${ID}'; `
        conn.commit(commit)
        conn.query(commit,(err) =>{
          if(err) {
            console.log("error in updating date")
            throw err;
          }
        })
        console.log("Biweekly")

    }

    else  {
      let nextDate = moment(Date.add(30,'days', true)).format("MM/DD/YY")
      console.log(nextDate)
      let commit = `update Users set User_EndPeriodDate = '${nextDate}' where User_id ='${ID}'; `
      conn.query(commit,(err) =>{
        if(err) {
          console.log("error in updating date")
          throw err;
        }
      })
      console.log("Monthly")

    }
  })
}






app.get('/', (req, res) => {
  let devicetype = ''

  // res.render('Login');
  if (req.cookies.user_id == null) {
    res.redirect('/LandingPage')
  }


  else if (req.cookies.user_id) {
    // res.json(req.cookies.user_id)
      // let sql = `select User_Name, User_email, Users_ProfileImage from Users where User_id = '${req.cookies.user_id}'`;
      let Hours = `select * from Hours where UserID='${req.cookies.user_id}' order by Date desc;`;
      
      // let user = `select User_id, User_deduction from Users where User_id = '${req.cookies.user_id}'`;

      if(req.device.type === 'phone') {
        devicetype = 'phone'

      }

      else if(req.device.type === 'tablet') {
        devicetype = 'tablet'

      }else{
        devicetype = 'desktop'
        //desktop
      }

      // conn.query(`select User_wage,User_deduction from Users where User_Id='${req.cookies.user_id}'`,(err,userInfo) =>{
      //   let deductions = userInfo[0].User_deduction;
      //   let wage = userInfo[0].User_wage;
      //   conn.query(`select SUM(TotalHours) as TotalH, SUM(TotalEarned) as TotalM from Hours where UserID='${req.cookies.user_id}';`, (err,Totals) =>{
      //     if(err) {
      //       console.log("total sum error")
      //     }

      //     let Total = {
      //       totalHours:Totals[0].TotalH,
      //       totalMoney:Totals[0].TotalM,
      //       taxes:Number(Totals[0].TotalM * deductions).toFixed(2)
      //     }
      //   })
      // })

      conn.query(Hours, (err,rows) =>{
        let obj = {}
        let HoursArray = []
        for(let i in rows) { 
          obj ={
            ClockIn:rows[i].ClockIn,
            ClockOut:rows[i].ClockOut,
            Startbreak:rows[i].Startbreak || "No Break",
            EndBreak:rows[i].EndBreak || "No Break",
            Date:moment(rows[i].Date).format("MMM DD"),
            TotalHours:rows[i].TotalHours,
            TotalEarned:rows[i].TotalEarned

          }
       
          HoursArray.push(obj)
        }

        conn.query(`select User_wage,User_deduction from Users where User_Id='${req.cookies.user_id}'`,(err,userInfo) =>{
          let deductions = userInfo[0].User_deduction;
          let wage = userInfo[0].User_wage;
          conn.query(`select SUM(TotalHours) as TotalH, SUM(TotalEarned) as TotalM from Hours where UserID='${req.cookies.user_id}';`, (err,Totals) =>{
            if(err) {
              console.log("total sum error")
            }
  
             let TotalInfoObj = {
              totalHours:Totals[0].TotalH,
              totalMoney:Totals[0].TotalM,
              taxes:Number(Totals[0].TotalM * deductions).toFixed(2)
            }

            // console.log(TotalInfoObj)
            res.render("Home", {Hours:HoursArray, deviceType:devicetype, TotalHours:TotalInfoObj.totalHours, TotalMoney:TotalInfoObj.totalMoney, Totaltaxes:TotalInfoObj.taxes}) 

          })
        })
    })
  }

  else {
    res.redirect('/Login')
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
  let AllDate = month + "/" + date + "/" + year



  




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
          // let weekDate = req.body.EndPeriodDate;
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


          let sql = `insert into Users Values ('${nanoid()}','${req.body.userName}', '${req.body.Email}', ${Number(req.body.Wage)}, ${Number(req.body.Deduction) / 100}, ${OvertimeType}, '${req.body.DatePickerEnd}', '${hash}', '${AllDate}', '${req.body.PaymentRate}', '${req.body.payOut}' , ${null});`;
          // res.json(sql)
          conn.commit(sql)
          // conn.query(sql, (errorInAccount, rows) => {
          //   if (errorInAccount) {
          // //     // res.json("An error occured please try again")
          //     console.log("error happened inserting Data")
          //   }
          // //   // console.log(rows)


          // })
          res.redirect('/Login')
        })

      })
      // res.redirect('/')

    }

  })

  // res.redirect('/')
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
      let AllDate = month + '/' + date + '/' + year;
      

      let hour1 = checkIn.toLocaleTimeString('en-US', options);
      let hour2 = clockOut.toLocaleTimeString('en-US', options);
      let break1 = startOfBreak.toLocaleTimeString('en-US', options) || null
      let break2 = endOfBreak.toLocaleTimeString('en-US', options) || null
      
      // if(hour1 === hour2) {
      //   res.send("<script>alert('Your shift cant be the same time'); window.history.back() </script>")
      // }

      // if(break1 === break2) {
      //   res.send("<script>alert('Your Lunch break cant be the same time'); window.history.back() </script>")


      // }

      
      if (break1 === "Invalid Date" || break2 === "Invalid Date") {
        let totalMoney = hours * wage;
        if (hour1.includes("AM") && hour2.includes("PM")) {
          //check hour
        }

        else if (hour1.includes("AM") && hour2.includes("AM")) {

        }

        else if(hour1.includes("PM") && hour2.includes("PM")) {
          
        }
        let sql = `insert into Hours values ('${nanoid()}', '${req.cookies.user_id}', '${hour1}', '${hour2}', ${hours}, ${null}, ${null}, ${null}, ${hours * wage}, '${AllDate}')`
        conn.commit(sql);
        // res.redirect('/DataSubmited')
        res.redirect('/')
        

        // res.send(Success);

      } else {
        let sql = `insert into Hours values ('${nanoid()}', '${req.cookies.user_id}', '${hour1}', '${hour2}', ${hours - totalBreakTime}, '${break1}', '${break2}', ${totalBreakTime}, ${(hours - totalBreakTime).toFixed(2) * wage}, '${AllDate}')`
        conn.commit(sql)
        // res.redirect('/DataSubmited')
        // res.send(Success)
        res.redirect('/')

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




