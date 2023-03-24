const fs=require('fs');
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const morgan=require('morgan');/* npm i morgan */
const dotenv=require('dotenv');/* dotenv pakage of environmental variables  */
dotenv.config({path:'./config.env'});
// console.log(process.env);/* it outputs all environmental variables used*/

if(process.env.NODE_ENV==='development')
{
app.use(morgan('dev'));/* it allows us to display requests in terminal   before(npm i morgan)  */

}

app.use(express.json()); 
app.use(express.static("./public"));
// console.log(app.get('env'));
// define a port and a function a function starts executing at that point only
// app.use((req,res,next)=>{
//     console.log("welcome to middleware");
//     next();

// });







const DB=process.env.DATABASE;/* .replace('<PASSWORD>',process.env.DATABASE_PASSWORD); */
        /* the vlaues are acutally stored in config.env file  if you want to connect to  localdatabase use process.env.DATABASE_LOCAL*/
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
}).then((/* con */)=>{
  // console.log(con.connections);
  console.log("mongodb connected");
});

const tourschema= new mongoose.Schema({
name:{
  type:String,
  unique:true,
  required:[true,"tour must have a name"]/* required means it must be in data  we pass array which displays 
  error if not included  you can also use default:  */
},
rating:Number,
price:Number
});

const tour=mongoose.model('tour',tourschema);/*name of the collection and schema  */





app.get('/top-5-route',async(req, res) => {
  console.log('req recieved');
  req.query.limit='5';
  req.query.fields='name,rating,price,difficulty,duration';
  req.query.sort='price,-duration';


  try{
    console.log(req.query);/* it displays the querys in the req url i.e localhost:3000/api/v1/tours?name=myname&rating=4.7
                              it displays name and rating in console */

const queryobj={...req.query}; /* creating copy of req.query as object in queryobj */

const exclude=['page','fields','sort','file','limit'];
exclude.forEach(el=>delete(queryobj[el]));/* we want to remove the words like sort files fields as we need to pass it to the 
                                          find function as req.body  */

let querystr=JSON.stringify(queryobj);/* convert into string to replace some data */

querystr=querystr.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`);/* replaces all matching to gte|gt... are if in url it 
                                                                        replaces them all with $gt|$gte as in mongo a help of callback fun  */

console.log("the find string is",JSON.parse(querystr));   /* consoling by converting back to json  */  
   
let temptours= tour.find(JSON.parse(querystr));
if(req.query.sort)
{
  const multisort=req.query.sort.split(',').join(' ');/* if sorting given multiple querys then split based on comma and join with space then pass it to sort fun */
temptours=temptours.sort(/* req.query.sort */ multisort);/* if the url request for sorting based on price rating etc the sort function
                                           does that  if we want to sort in reverse write -behind it like ocalhost:3000/api/v1/tours?sort=-price */
}
else {
  temptours=temptours.sort('price');
}


if(req.query.fields)
{
const fields=req.query.split(',').join(' ');
temptours=temptours.select(fields);/* it returns the fields only that mentioned  */

}

const page=req.query.page*1||1;
const limit=req.query.limit*1||100;
const skip=(page-1)*limit;
temptours=temptours.skip(skip).limit(limit);
if(req.query.page){
  const counttours=tour.countDocument();
  if(skip>=counttours) throw Error('this page does not exit');
}



const tours=await temptours;
res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });

  }
  catch(err){
    res.status(404).json({
      status:'failed',
      message: err
    });
  }

  /*  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  }); */
});





app.get('/api/v1/tours',async(req,res)=>{
// res.send('hello from the server');
// or
// res.status(200).send('using status');
// or
// res.json({message:"how are you", text:"not food"});

 try{
    console.log(req.query);

const queryobj={...req.query};

const exclude=['page','fields','sort','file','limit'];
exclude.forEach(el=>delete(queryobj[el]));

let querystr=JSON.stringify(queryobj);

querystr=querystr.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`);

console.log(JSON.parse(querystr));  
   
let temptours= tour.find(JSON.parse(querystr));
if(req.query.sort)
{
  const multisort=req.query.sort.split(',').join(' ');
temptours=temptours.sort(multisort);
                                         
}
else {
  temptours=temptours.sort('price');
}


if(req.query.fields)
{
const fields=req.query.split(',').join(' ');
temptours=temptours.select(fields);

}

const page=req.query.page*1||1;
const limit=req.query.limit*1||100;
const skip=(page-1)*limit;
temptours=temptours.skip(skip).limit(limit);
if(req.query.page){
  const counttours=tour.countDocument();
  if(skip>=counttours) throw Error('this page does not exit');
}



const tours=await temptours;
res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });

  }
  catch(err){
    res.status(404).json({
      status:'failed',
      message: err
    });
  }

  
});  /* app.get send data to the url mentioned in that port and recieves the request and response back */






app.get('/api/v1/tours/:id',async(req, res) => {

try{
const tours=await tour.findById(req.params.id);
res.status(200).json({
  status:"succus",
  data:{
    tours
  }
})
}catch(err)
{
res.status(404).json({
  status:'failed',
  message:"not found"
})
}

/* console.log(req.params);/* params holds all variables in the "/link" * /
const id=req.params*1;/* it convert string to number * /
const finde=tour.find(element=>element.id===id);
res.json({
 status:"succus",
 data:{
    finde

}
}); */
});
/* it is dynamic routing params specifys the dynamic values if anything is optional put ? infront of it ./:id?/:x like this */
/* 
// we can also write it as app.get('api/v1/tours',some function (as it is called as a callback function))
// or also can write as- app.route('api/v1/tours').get(callbackfunction).post(callbackfunction):-here app.route defines a path and then the methods executes the functions which call inside them  
 */



app.post('/api/v1/tours',async(req, res) => {


  try{
  const newtour=await tour.create(req.body); /* const testtour=new tour({
                                               name:"normal",
                                               rating:4.8,
                                                price:345
                                               });/* defining the data * /


                                              testtour.save().then(doc=>{
                                              //   console.log(doc);

                                              }).catch(err=>{
                                                console.log("error: ",err);
                                               });/* it sends the data to the database * /

                                               */
   res.status(201).json({
        status: 'success',
        data: {
          tour: newtour
        }
      });
    }catch(err){
      res.status(400).json({
        status:'failed',
        message:err
      });}
/*   
// res.send('how r y');
console.log(req.body);
    // const newId=tours[tours.length-1].id+1;
    // const newtour=Object.assign({ {id:newId},req.body});
   
    // tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.json({
            status:'succus',
            data:{
                newTour
            }
        });
    });
// res.send(req.body);
 */
});





app.patch('/api/v1/tours/:id',async(req, res) => {

  try{

  
  const tours=await tour.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  });
  res.status(200).json({
status:"succus",
data:{
  tours
}
  }); 
}catch(err)
{
   res.status(400).json({
        status:'failed',
        message:"invalid data putted"
      });
}
  /* res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  }); */
});






app.delete('/api/v1/tours/:id',async (req, res) => {
  try{
   await tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
  }catch(err){
    res.status(400).json({
        status:'failed',
        message:"invalid data putted"
      });
  }
})






const port=process.env.PORT||3000;
const tourse=JSON.parse(
fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`,'utf-8'));

app.listen(port,()=>{

});/* app.listen starts a server at port 'port'  it has a callback function */