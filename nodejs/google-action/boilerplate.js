const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());
const port = 3333;
const dialogflow = require("dialogflow-fulfillment")
const { WebhookClient } = require('dialogflow-fulfillment');


app.post("/webhook",(request,response)=>{
    const agent = new WebhookClient({request: request, response: response});

    function welcome(agent) {
        return agent.add(`Welcome to my agent!`);
      }
    let intents = new Map()
    
   intents.set("demo",welcome)
   agent.handleRequest(intents)
})

app.get("/",(req,res)=>{
    res.send("hello world.c");

})
app.listen(port,()=>{
    console.log("server is start @ ",port)
})
