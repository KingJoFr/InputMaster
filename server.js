const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const connectDB = require('/home/kingjofr/Desktop/InputMaster/mydb.js');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
dotenv.config();
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.set('layout', './layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);
connectDB();
app.listen(process.env.PORT || 3000);