const express=require("express");
const app=express();
const cookieParser=require("cookie-parser")
app.use(cookieParser("vineet"));
const session=require("express-session")

const path=require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const flash=require('connect-flash')

app.use(session({secret:"MySecret",resave:false,saveUninitialized:true }));app.use(flash());
// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     }else{
//         req.session.count=1;
//     }
//     res.send(`You sent the request ${req.session.count} times`)
// })
 app.get("/register",(req,res)=>{
    let {name="anonymous"}=req.query;
    req.session.name=name;
    if(name==="anonymous"){
        req.flash("error","User not registered")
    }else{
         req.flash("success","user registered successfully")
    }
  
    res.redirect("/hello")
 })
 app.get("/hello",(req,res)=>{
    res.locals.smsg=req.flash("success")
    res.locals.emsg=req.flash("error")
    res.render('sample.ejs',{name:req.session.name})
    
    console.log(req.session);
 })
app.listen(3000,()=>{
    console.log("on port 3000")
})
app.get("/test",(req,res)=>{
    res.send('Testing..')
})
