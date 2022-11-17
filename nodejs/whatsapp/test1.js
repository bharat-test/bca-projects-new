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
    if (msg.body == '!ping') {
        msg.reply('pong');
    }else if (msg.body === '!buttons') {
        let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }
    else if(msg.body=="order"){
        const section = {
            title: 'test',
            rows: [
              {
                title: 'Test 1',
              },
              {
                title: 'Test 2',
                id: 'test-2'
              },
              {
                title: 'Test  3 loll ',
                description: 'This is a smaller text field, a description'
              },
              {
                title: 'Test 4',
                description: 'This is a smaller text field, a description',
                id: 'test- 4 ',
              }
            ],
          };

       const list = new List('test', 'click me', [section], 'title', 'footer')
       client.sendMessage(msg.from,list);
    }
    else if(msg.body=="hii"){
      const buttons_reply = new Buttons('welcome to my bank i am here to help you please click on the button below to alive services', [{body: 'getbalance', id: 'getbalance'},{body: "get last 5 transaction"},{body: "get last 5 transaction"}], 'myBank++', 'mybank-ac') // Reply button
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
        let name=result[0].name;
      let ac_no=result[0].ac_no;
      let balance = result[0].balance;
      
      let messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance;
      client.sendMessage(msg.from,messg);
  //console.log("balance = "+result[0].balance) 
  //console.log("ac_no = "+ result[0].ac_no)
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
app.listen(port,()=>{
  console.log("server is start @ ",port)
})
