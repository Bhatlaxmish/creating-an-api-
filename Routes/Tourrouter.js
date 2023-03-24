const express=require('express');
const router=express.Router();
router.params('id',(req,res,next,val)=>{
console.log(val);
next();
});
router.route('/').get(getalltour).post(createtour);
/* its another way of writing 
app.route('/api/v1/tour').get(some function ).post (some function) ;like that*/

// if there is only one route then we export it as 
module.exports=router;
// then in the file where you want to use it call it as
// const userrouter=require('./Routes/tourrouter')