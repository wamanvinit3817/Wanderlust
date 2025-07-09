const express=require("express");
const app=express();


const path=require("path");

const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
/*app.use(express.static(path.join(__dirname,"public")));*/
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));
const methodoverride=require("method-override");

app.use(methodoverride("_method")); 
app.use(express.json());
const listing=require("../models/listing.js");
const review=require("../models/review.js");
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate)
const router=express.Router();
const cookieParser=require("cookie-parser");
app.use(cookieParser());
const user=require("../models/user.js");
const { route } = require("./listing.js");
const passport = require("passport");
const Listing = require("../models/listing.js");

router.get("/signup",(req,res,next)=>{
    
    res.render("signup.ejs")
})

router.post("/signup", async(req,res,next)=>{
    try{
    let{username,email,password}=req.body;
    let newUser=new user({email,username});
    let regUser=await user.register(newUser,password);
    req.login(regUser,(err)=>{
        if(err){
            return next();
        }
        req.flash("success",`${username},Welcome to Wanderlust!`)
        res.redirect("/listings")
    })
    
    }catch(err){
        req.flash("error",err.message)
        res.redirect("/signup")
    }
})
router.get("/login",(req,res,next)=>{
    //res.locals.originalUrl=req.originalUrl;
    res.render("login.ejs")
})

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async (req,res,next)=>{
    req.flash("success","Welcome to WanderLust!You are logged in.");

   res.redirect("/listings");
    
})

router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }else{
            req.flash("success","You are LoggedOut now.");
            res.redirect("/listings");
        }
    })
})
// router.get("/wishlist",async (req,res)=>{
    
//     let wishlists = req.user.wishlist;

// for (let id of wishlists) {
//   console.log("Listing ID:", id.toString()); // convert ObjectId to string
// }
// const listings = await Listing.find({ _id: { $in: wishlists } });

// res.render("wishlist.ejs", { listings }); // assuming result is that array


 


// })


// router.get("/wishlist", async (req, res) => {
//   try {
//     const user = await user.findById(req.user._id).populate("wishlist");

//     if (!user) {
//       req.flash("error", "User not found.");
//       return res.redirect("/listings");
//     }

//     const result = user.wishlist; // populated array of listings

//     res.render("wishlist.ejs", { listings: result });

//   } catch (err) {
//     console.log(err);
//     req.flash("error", "Something went wrong.");
//     res.redirect("/listings");
//   }
// });


router.post("/search",async (req,res)=>{
    try{
    let title=req.body.search;
  
   listing.find({title:title}).then((result)=>{
    if(result.length != 0){
     listing.find({title:title}).then((result)=>{res.render("search.ejs",{result})})
    }else{
          req.flash("error","No listing matched with your search")
          res.redirect("/listings")
    }
   })
    }catch(err){
       throw new ExpressError("Something went wrong.")
    }
  
})

module.exports=router;