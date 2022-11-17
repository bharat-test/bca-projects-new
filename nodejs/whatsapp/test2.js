const balanceWorker = require('./worker/getbalance');
    let num="919966617574@c.us";
    num = num.slice(2);
    num = num.slice(0, -5); 
    num = parseInt(num)
  let name;
    let ac_no;
    let num1;
let balance;
    let result =  balanceWorker.getbalance(num);
  let a=  result.then(function(result) {
      name=result[0].name;
     ac_no=result[0].ac_no;
     //ac_no=toString(ac_no);
     balance = result[0].balance;
    num1= ac_no;
    let result2= balanceWorker.gettransaction(num1);
    result2.then(function(result2){
      console.log(result2);
      console.log(ac_no)
   console.log(name)
      let messg2=" ";
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
          balance=balance;
          if(type="dr"){
           balance= result2[i+1].amount-amount;
          }
          messg2= messg2+ "\n|"+ " payment_mode = "+payment_mode+" amount= "+amount+" bank_ref_id: "+bank_ref_id+
          " type: "+type+" payment_date= "+payment_date+"balance: "+balance+ "|" ;
    }
    let messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance+"and last 5 transaction are as follows \n"+messg2;
    console.log(messg);
  
  })
    })
    
    
     
    
    
    
    
  