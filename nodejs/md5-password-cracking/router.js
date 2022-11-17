//const e = require("express")
var express= require("express")
var router = express.Router()
router.post('/getpassword',(req,res)=>{
    let password=req.body.md5;
    const spawn = require("child_process").spawn;       
const pythonProcess = spawn('python',["hashlookup.py", "-a", "md5", "-i","words-md5.idx","-w","words.txt","-c",password]);
pythonProcess.stdout.on('data', function(data) {

    console.log(data.toString());
    res.render('password',{password:data})
    // res.write(data);
    // res.end('end');
});
    
})
module.exports = router;