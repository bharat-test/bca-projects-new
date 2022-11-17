
// let num=agent.context.get("awaiting_number").parameters['phone-number'];
const balanceWorker = require('./worker/getbalance');

function  getbal(num){
    let messg;
    num = parseInt(num) 
    //console.log(num)          
    let result =  balanceWorker.getbalance(num);
   result.then(dobal).catch(loginFail);
    
    
    function dobal(result){
       // console.log(result)
        let name=result[0].name;
    let ac_no=result[0].ac_no;
    let balance = result[0].balance;
    messg="hy "+name+" your ac "+ac_no+" has balance of Rs."+balance;
    
    } 
    function loginFail( err) {
        console.log("login failed: " + err);
  }
    
   // console.log("mmsg"+messg)
   console.log(messg);
}
let num=9966617574;
let ms= getbal(num);

