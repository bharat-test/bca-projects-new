const express = require('express')
const app = express()
const bodyparser = require("body-parser")
const router = require('./router')
app.set('view engine','ejs')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use('/route',router)
app.get('/', (req, res) => {
  //res.send('hello world')
  res.render('index',{lol:"lol"})
})

app.listen(8000,()=>{ console.log("server started @ 8000")})
