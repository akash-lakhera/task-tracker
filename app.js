const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path=require('path')
const port = process.env.PORT || 3000
//it has been done
const tasks = require("./server/routes/tasks");
const previousTasks=require("./server/routes/previous")
const connectDB = require("./server/db/connect");
const errorHandlerMid=require("./server/middlewares/errorHandler");

const app = express(); //create server
const pathLogger=(req,res,next)=>{
  console.log("Here is the URL : "+req.url);
  next();

}
const checkAuth=(req,res,next)=>{ //checks logged in status of a user
    if (req.isAuthenticated()){
        next()
    }
    else
    res.status(401).send("Unauthorised")
}
app.use(express.json());
require("dotenv").config();

let conn = connectDB(process.env.MOGA);
//establish connection to database
const MongoStore = require("connect-mongo")(session);
let sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    rolling:true,
    cookie: {
      maxAge: 1000 * 60*60*24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);
app.use(pathLogger)
require('./server/auth/passport')
app.use(passport.initialize())
app.use(passport.session());
app.use(express.static(path.join(__dirname,"build"),{index:false}));
app.use('/api/v1/tasks',checkAuth, tasks);
app.use("/api/v1/previous",checkAuth, previousTasks)
app.get('/google/auth',
passport.authenticate('google',{scope:['email','profile']}))
app.get("/google/callback",passport.authenticate('google',{successRedirect:'/',failureRedirect:'/login'}))
app.get("/user",(req,res,next)=>{


  if(req.isAuthenticated())
  res.status(200).send(JSON.stringify(req.user.name))
  else
  res.status(401).send("Unauthorised")
})
app.get("/login",(req,res,next)=>{
  res.sendFile(path.join(__dirname,'server','loginpage.html'))
})
app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.status(200).send({msg:"successful"})
  });
});
app.get("*",(req,res,next)=>{
    if(!req.user){
      res.redirect('/login')
    }
    else
    {
      res.sendFile(path.join(__dirname,'build','index.html'))
    }
    
    });
    app.use(errorHandlerMid)
 conn.then((value)=>{
 
  app.listen(port, () => {
  console.log("server is running");
})}).catch((err)=>{
  console.log(err)
})  

