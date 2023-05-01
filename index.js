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

app.set('trust proxy', 1);
app.set('views', path.join('views'));
app.set('view engine', 'ejs');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.render('Home');
});

app.listen(3000, () => {
  console.log('server running in port 3000');
});
