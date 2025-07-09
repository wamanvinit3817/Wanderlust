
if(process.env.NODE_ENV != "production"){
  require("dotenv").config()
}



const dburl=process.env.ATLAS_URL;
const express=require("express");
const app=express();

const port=8080;
const path=require("path");
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate)
const listings=require("./routes/listing.js");
const userRoute=require("./routes/user.js");
const MongoStore = require('connect-mongo');
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const passport=require("passport");
const localStrategy=require("passport-local");
const user=require("./models/user.js");
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
const methodoverride=require("method-override");
app.use(methodoverride("_method")); 
app.use(express.json());
const mongoose=require("mongoose");
const session=require("express-session");
const cookieParser=require("cookie-parser")
app.use(cookieParser("vineet"));
const flash=require('connect-flash');
const multer=require("multer");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const review = require("./models/review.js");
const upload=multer({dest:"uploads/"})

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("eroor in mongo store")
})
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    }
   
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success"); 
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    res.locals.originalUrl= req.session.redirectUrl;
    next();
})

app.get("/demo",async (req,res)=>{
    let fake=new user({
        email:"demo@gmail.com",
        username:"demo"
    });
   let ruser= await user.register(fake,"hellodemo");
   res.send(ruser);
})



main()
.then(()=>{
    console.log("Connection sucessfull")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    
    await mongoose.connect(dburl)
}
app.listen(port,()=>{
    console.log(`On port ${port}`)
})

app.get("/listings/search/price",(req,res)=>{
    res.render("price.ejs")
   
})
app.post("/listings/search/price/find",wrapAsync(async (req,res)=>{
    let price=req.body.price;
    let listings=await Listing.find({price:{$lte:price}})
   if(listings.length != 0){
    res.render("pricefind.ejs",{listings})
   }
   else{
    req.flash("error","No listings found at this Pricepoint");
    res.redirect("/listings")
    
   }
}))
app.get("/listings/search/country",(req,res)=>{
    res.render("country.ejs")
   
})
app.post("/listings/search/country/find",wrapAsync(async (req,res)=>{
    let country=req.body.country;
    let listings=await Listing.find({country:country})
   if(listings.length != 0){
    res.render("pricefind.ejs",{listings})
   }
   else{
    req.flash("error","No listings found at this location");
    res.redirect("/listings")
    
   }
}))

app.use("/listings",listings);
app.use("/",userRoute);


app.use((err,req,res,next)=>{
   let {statusCode=500,message="Something went wrong.Please try again"}=err;
   res.render("error.ejs",{err})
})
app.get("/", (req, res) => {
    res.redirect("/listings");
});

