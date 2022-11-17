const { Client,List, Buttons,LocalAuth } = require('whatsapp-web.js');
const express = require("express");
const bodyParser = require("body-parser");
const { phoneNumberFormatter } = require('./helper/formatter');
const balanceWorker = require('./worker/getbalance');

const app = express().use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth()
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

const port=4444;

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
      if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }
    
    else if(msg.body=="hii"){
      const buttons_reply = new Buttons('welcome to my bank i am here to help you please click on the button below to alive services', [{body: 'getbalance', id: 'getbalance'},{body: "getlast5transaction", id:'getlast5transaction'},{body: "get last 10 transaction"}], 'myBank++', 'mybank-ac') // Reply button
      client.sendMessage(msg.from, buttons_reply);
      
      //console.log(num)
    }
    else if(msg.body=="getbalance"){
      let num=msg.from;
      num = num.slice(2);
      num = num.slice(0, -5); 
      num = parseInt(num)
      //console.log(num);
      let result =  balanceWorker.getbalance(num);
      result.then(function(result) {
     // console.log(result)
     if(result[0]==undefined){
      let messg="sorry you dont have ac";
      client.sendMessage(msg.from,messg);
     }else{
        let name=result[0].name;
      let ac_no=result[0].ac_no;
      let balance = result[0].balance;
      let messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance;
      client.sendMessage(msg.from,messg);
  //console.log("balance = "+result[0].balance) 
  //console.log("ac_no = "+ result[0].ac_no)
     }
})
      
    }

    else if(msg.body=="getlast5transaction"){
      let num=msg.from;
      num = num.slice(2);
      num = num.slice(0, -5); 
      num = parseInt(num)
      let name;
      let ac_no;
  let balance;
      let result =  balanceWorker.getbalance(num);
      result.then(function(result) {
        if(result[0]==undefined){
          let messg="sorry you dont have ac";
          client.sendMessage(msg.from,messg);
         }else{
       name=result[0].name;
       ac_no=result[0].ac_no;
       //ac_no=toString(ac_no);
       balance = result[0].balance;
       try{
        
        let result2= balanceWorker.gettransaction(ac_no);
        result2.then(function(result2){
          console.log(result2);
          let messg2="";
          let payment_mode="" ;
               let amount="";
               let bank_ref_id="";
               let type="";
               let  payment_date="" ;
                let i=0;    
          
           for(i;i<=result2.length-1;i++){
             payment_mode=result2[i].payment_mode;
             amount=result2[i].amount;
             bank_ref_id=result2[i].bank_ref_id;
              type=result2[i].type;
              payment_date=result2[i].payment_date;
              
              messg2= messg2+ "\n|"+ " payment_mode = "+payment_mode+" amount= "+amount+" bank_ref_id: "+bank_ref_id+
              " type: "+type+" payment_date= "+payment_date+" |" ;
        }
        let messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance+"and last 5 transaction are as follows \n"+messg2;
        //console.log(messg);
        client.sendMessage(msg.from,messg);
      
      })
      }catch(error){
        console.log(error)
      }
    }
      })
      
      
      
      
    }
    
})
    
// post resqest for sending mssg and otp msg
app.get("/",(req,res)=>{
  res.send("hello world.c");

})
app.post("/send-msg",(req,res)=>{
  //const number = phoneNumberFormatter(req.body.number);
  let number=req.body.number;
  number=number+"@c.us";
  const message = req.body.message;
  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
 // res.send("msg send to"+number);

})

app.post("/send-diwali",(req,res)=>{
  //const number = phoneNumberFormatter(req.body.number);
  let number=req.body.number;
  number=number+"@c.us";
 // const message = req.body.message;
 const message= new Buttons('Diwali wishes from me and my family to you and your family 😇 blessings to youngers and blessed from elders 🙏', [{body: 'wish you the same'}], 'Happy Diwali', 'from Bharat M Pandiya.') // Reply button
     
  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
 // res.send("msg send to"+number);

})
//diwali wishes
app.listen(port,()=>{
  console.log("server is start @ ",port)
})
