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
const passport = require("passport");
app.use(cookieParser());
const {isLoggedin}=require("../middleware.js");
const multer=require("multer");
const {storage}=require("../cloudconfig.js");
const upload=multer({storage});
const geocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const user = require("../models/user.js");
const Listing = require("../models/listing.js");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = geocoding({ accessToken:mapToken });


app.get("/",(req,res)=>{
    res.send("on root")

})
// router


router.get("/",wrapAsync(async (req,res)=>{
   await listing.find().then((result)=>{ res.render("index.ejs",{result})});
   
}))

router.get("/new",(req,res)=>{
    
 
  if(!req.isAuthenticated()){

     req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be Logged in to create Listing.");
    res.redirect("/login");
  }else{
    res.render("new.ejs")
  }
    
})

router.post("/",upload.single("image"),wrapAsync(async (req,res,next)=>{
  console.log(req.file)
    if(!req.body.title || !req.body.description || !req.body.price || !req.body.location || !req.body.country){
        throw new ExpressError(400,"Send valid data for your listing")
    }
  let response= await geocodingClient.forwardGeocode({
  query: req.body.location,
  limit: 1
  }).send()
     
    
//   console.log(response.body.features[0].geometry); 
    await listing.insertOne({title:req.body.title,description:req.body.description,image:req.file.path,price:req.body.price,location:req.body.location,country:req.body.country,owner:req.user._id,geometry:response.body.features[0].geometry}).then((data)=>{console.log(data)})
     
    req.flash("success","New listing created sucessfully!")
   
    res.redirect("/listings")
      
}))

router.get("/edit/:id",wrapAsync(async (req,res,next)=>{
    let id=req.params.id;
    await listing.findById(id).then((result)=>{
        if(!result){
            req.flash('error',"Listing doesnot exist")
        }else{
            if(!req.isAuthenticated()){

                
            req.flash("error","You must be Logged in to Edit Listing.");
            res.redirect("/login");
            
        }else{
         res.render("edit.ejs",{result})
          }
       }}) 
}))
router.patch("/edit/:id",upload.single("image"),wrapAsync(async (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        
            req.flash("error","You must be Logged in to Edit Listing.");
            res.redirect("/login");
        }else{
         if(!req.body.title && !req.body.description && !req.body.price && !req.body.location && !req.body.country){
        throw new ExpressError(400,"Send valid data for your listing")
    }
        await listing.findByIdAndUpdate(req.params.id,{title:req.body.title,description:req.body.description,image:req.file.path,price:req.body.price,location:req.body.location,country:req.body.country}).then(()=>{ req.flash("success","Listing Edited sucessfully!");res.redirect(`/listings/show/${req.params.id}`)} )
          }
    
   
    
}))
router.delete("/delete/:id",isLoggedin,wrapAsync(async (req,res,next)=>{
   await listing.findByIdAndDelete(req.params.id).then(()=>{ req.flash("success","Listing Deleted sucessfully!");res.redirect("/listings")})
    
}))
router.get("/show/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const listing = await Listing
      .findById(id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "owner" }
      });

    if (!listing) {
      req.flash("error", "The listing does not exist.");
      return res.redirect("/listings");
    }

    res.render("show.ejs", { listing, req });

  } catch (err) {
    console.error("Error fetching listing:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings");
  }
});

router.post("/:id/reviews",wrapAsync(async(req,res,next)=>{
    let id=req.params.id;
   
    let listingr=await listing.findById(id)
    let newReview=new review(req.body.review)
     
     if(!req.isAuthenticated()){
         
            res.locals
            req.flash("error","You must be Logged in to Review Listing.");
            res.redirect("/login");
        }else{
    if(!newReview.comment || !newReview.rating || newReview.rating<1 || newReview.rating>5){
         throw new ExpressError(400,"Send valid data for your listing")
    }else{
        newReview.owner=req.user._id;
        
        listingr.reviews.push(newReview)
    await newReview.save();
   await listingr.save()
    req.flash("success","Review created sucessfully!")
    
   res.redirect(`/listings/show/${id}`)}

    }
    
}))

router.delete("/:id/reviews/:reviewid",wrapAsync(async (req,res,next)=>{
    let listingId=req.params.id;
    let reviewId=req.params.reviewid;
    
   await listing.findByIdAndUpdate(listingId,{$pull:{reviews:reviewId}}).then();
   await review.findByIdAndDelete(reviewId).then();
    req.flash("success","Review deleted sucessfully!")
    res.redirect(`/listings/show/${listingId}`);
    
}))
router.get("/wishlist/:id",async(req,res,next)=>{
    let id=req.params.id;
 let userid=req.user._id
 console.log(userid)
//  console.log(userid);
    // listing.findById(id).then((data)=>{console.log(data)})
//    let listing=await Listing.findById(id);
   await user.findByIdAndUpdate(userid, { $push: { wishlist: id} }).then((data)=>{console.log(data)}); 
    res.send("on wishlist")
   console.log(req.user)
})


module.exports=router;
