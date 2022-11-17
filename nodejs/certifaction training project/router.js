const e = require("express")
var express= require("express")
var router = express.Router()
const loanWorker = require('./worker/getloans')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const pdf2base64 = require('pdf-to-base64');
const path = require("path");
const postsign=require("./worker/postsign")
const axios = require('axios');
router.get('/start',(req,res)=>{
    res.render('start',{"start":true})
})
router.post('/sendotp',async (req,res)=>{
    if(req.body.number){
        req.session.number = req.body.number;
        req.session.otp = Math.floor(
            Math.random() * (999 - 100)+100);
            console.log("otp is"+req.session.otp)
           
      
            let req1= await axios.get('https://api.authkey.io/request',{ params: { authkey: '54e0e360f8ac7ec3',mobile:req.session.number,country_code:'91',voice:'Hello, your OTP is '+req.session.otp+'i repeate your otp is '+req.session.otp } })
    res.render('otpinput',{"number":req.session.number})
    }
    else{
        res.redirect('/')
    }
    })

router.post('/verifyotp',async (req,res)=>{
    if(req.body.otp==req.session.otp){
        req.session.user=req.session.number;
// getting loans from db
let loan= await loanWorker.getloan();
let l1=loan[0]
let l2=loan[1] 
let l3=loan[2]
//console.log(loan[1].loanamount)

     res.render("dashboard",{"number":req.session.number,"l1":l1,"l2":l2,"l3":l3})
    }
    else{
        res.end("otp not match");
    }
})

    

router.post('/data',async (req,res)=>{
    
    let pdfDoc = new PDFDocument; 
pdfDoc.pipe(fs.createWriteStream(path.join(__dirname,"pdf",req.session.number+'.pdf')));
pdfDoc.text("my frist name "+req.body.firstname+"my last name"+req.body.lastname+"my number"+req.session.number+"my adress "+req.body.adress+" siging this pdf for loan of amount"+req.body.loanamount);
pdfDoc.end();
let path1= "http://localhost:9999/pdf/"+req.session.number+'.pdf';
let base64= await pdf2base64(path1)
let name = req.body.firstname;
let result= await postsign.sign(base64,name) 
//  axios.post(
//     'https://test.zoop.one/contract/esign/v4/aadhaar/init',
//     {
//         'document': {
//              'data': base64,
//              'info': 'Bad Habits'
//          },
//          'signer_name': name,
//          'signer_email': 'kiranpandiya18@gmail.com',
//          'signer_city': 'mumbai',
//         'purpose': 'Purpose of transaction, Mandatory',
//          'response_url': 'https://webhook.site/e7d48f25-1a26-4c7b-8019-da4952a3cafe',
//          'redirect_url': 'http://api.webhookinbox.com/i/HYWEYJTT/in/'
//      },
//     {
//         headers: {
//             'app-id': '636cce4ff94eab001d6ae8fd',
//             'api-key': 'H3VZ9KY-Z4ZMQ9B-KMRQ5KA-NDN09X2',
//             'Content-Type': 'application/json'
//         }
//     }
// ).then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
console.log("lol  "+ result.data.request_id)
   
let reqid=result.data.request_id;
res.render('data',{"reqid":reqid})
})


router.get('/admin',(req,res)=>{
    res.render('admin',{admin:true})
})
router.post('/adminpanel',(req,res)=>{
    if(req.body.username=='admin' && req.body.password=='password'){
        res.render('adminpanel',{loans:loans,applications:applications})
    }
})
module.exports = router;