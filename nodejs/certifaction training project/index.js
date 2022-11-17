const express = require('express')
const app= express()
const path = require('path')
const bodyparser = require("body-parser")
const {v4:uuidv4}=require("uuid")
const router = require('./router')
const session = require("express-session")
const port = 9999
app.set('view engine','ejs')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
}))
app.use('/route',router)
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/pdf',express.static(path.join(__dirname,'pdf')))
app.get('/',(req,res)=>{
    res.render('base',{"title":"loan application"})
})
app.listen(port,()=>{console.log("server started on 9999")})