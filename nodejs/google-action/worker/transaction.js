const balanceWorker = require('./getbalance');
//let num="";
 let num=36361544872000002n;
 console.log(num)
num=num.toString();
console.log(num)
let result2 =  balanceWorker.gettransaction(num);
result2.then(function(result2) {
  console.log(result2)
 // console.log("balance = "+result[0].balance) 
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
     
      messg2=messg2+ " \n payment_mode = "+payment_mode+" amount= "+amount+" bank_ref_id: "+bank_ref_id+
     " type: "+type+" payment_date= "+payment_date;
    
 
 // console.log(messg);
     
 }
  console.log(messg2)
})
