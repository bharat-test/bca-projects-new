const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());
const port = 3333;
const dialogflow = require("dialogflow-fulfillment")
const { WebhookClient } = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const balanceWorker = require('./worker/getbalance');
const axios = require('axios');
var otp1;

app.post("/webhook",(request,response)=>{
    const agent = new WebhookClient({request: request, response: response});

    function welcome(agent) {
        return agent.add(`Welcome to my agent!`);
      }
    function askotp(agent){
        otp1= Math.floor(
        Math.random() * (999 - 100)+100
          )
          
         var  number = agent.context.get("awaiting_number").parameters['phone-number'];
         agent.context.set({
            'name':'awaiting_number',
            'lifespan': 5,
            'parameters':{
              'phone-number1':+otp1
              }
          });
         // console.log(number);

         ///sending otp to whatsapp
         const response =  axios.post(
            'http://localhost:4444/send-msg',
            {
                'number': "91"+number,
                'message': 'your otp for mybank app from google assistance is '+otp1
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
         //sending response to dialogflow
        return agent.add("please enter otp for "+number+"otp is");
    }
    function confirmotp(agent){
        var otp = agent.context.get("awaiting_otp").parameters['number'];
        var otpfromdialogflow = agent.context.get("awaiting_number").parameters['phone-number1'];
        var  number = agent.context.get("awaiting_number").parameters['phone-number'];
       // console.log("number"+number);
        //console.log("otp"+otp);
      //  console.log("otp from dialogflow"+otpfromdialogflow)
        if(otp==otpfromdialogflow){
          //  console.log("otp match")
          agent.context.set({
            'name':'awaiting_number',
            'lifespan': 5,
            'parameters':{
              'otpset':"sucess"
              }
          });
          function h(){
            agent.add("thanks for otp");
            agent.add(new Suggestion("getbalance"));
            agent.add(new Suggestion("getlast5transaction"));
          }
            return h();
        }else{
            return agent.add("otp not match please re-enter");
        }
       
    }
    async  function  getbalance(agent){
        let messg=" ";
        var sucess = agent.context.get("awaiting_number").parameters['otpset'];
        if(sucess=="sucess"){
            let num=agent.context.get("awaiting_number").parameters['phone-number'];
            num = parseInt(num) 
            //console.log(num)          
            let result =  await balanceWorker.getbalance(num);
           console.log(result)
        
          if(result[0]==null){
            messg="you dont have ac byee";
          }      
          else{
            let name=result[0].name;
      let ac_no=result[0].ac_no;
      let balance = result[0].balance;
            messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance;}            

       let messg2=messg;
       console.log(messg2)
            return agent.add(messg2);
     //messg= result.then(function(result) {
     //console.log(result)
        
      //console.log("mmsg "+messg)
     //  
      //})
       console.log(messg);
        }else{
            return agent.add("your session is not vaild enter your phone number");
        }
    }
    async function getlast5transaction(agent){
        let messg=" ";
        var sucess = agent.context.get("awaiting_number").parameters['otpset'];
        if(sucess=="sucess"){
            let num=agent.context.get("awaiting_number").parameters['phone-number'];
            num = parseInt(num) 
            //console.log(num)          
            let result =  await balanceWorker.getbalance(num);
          //  console.log(result)
            
      if(result[0]==null){
        messg="you dont have ac byee";
      }  else{
        let name=result[0].name;
      let ac_no=result[0].ac_no;
      let balance = result[0].balance;
      let result2= await balanceWorker.gettransaction(ac_no);     
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
       messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance+"and last 5 transaction are as follows \n"+messg2;
      //console.log(messg);
       
    }
    
       console.log(messg)
         return agent.add(messg);
     
       
    
        }else{
            return agent.add("your session is not vaild enter your phone number");
        }
    }
    let intents = new Map()    
   intents.set("demo",welcome)
   intents.set("askotp",askotp)
   intents.set("confirmotp",confirmotp)
   intents.set("getbalance",getbalance)
   intents.set("getlast5transaction",getlast5transaction)
   agent.handleRequest(intents)
})

app.get("/",(req,res)=>{
    res.send("hello world.c");

})
app.listen(port,()=>{
    console.log("server is start @ ",port)
})
