const express = require("express");
const app = express();
const path = require("path");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const ejsMate = require("ejs-mate");
const methodoverride = require("method-override");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });
const geocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const { isLoggedin } = require("../middleware.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const router = express.Router();

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = geocoding({ accessToken: mapToken });

// App setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.use(cookieParser());

router.get("/", wrapAsync(async (req, res) => {
  const result = await Listing.find();
  res.render("index.ejs", { result });
}));

router.get("/new", (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be Logged in to create Listing.");
    return res.redirect("/login");
  }
  res.render("new.ejs");
});

router.post("/", isLoggedin, upload.single("image"), wrapAsync(async (req, res) => {
  console.log("Uploaded file:", req.file);

  if (!req.body.title || !req.body.description || !req.body.price || !req.body.location || !req.body.country) {
    throw new ExpressError(400, "Send valid data for your listing");
  }

  const geoData = await geocodingClient.forwardGeocode({
    query: req.body.location,
    limit: 1
  }).send();

  const newListing = new Listing({
    title: req.body.title,
    description: req.body.description,
    image: {
      url: req.file.path,
      filename: req.file.filename
    },
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
    owner: req.user._id,
    geometry: geoData.body.features[0].geometry
  });

  await newListing.save();
  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
}));

router.get("/edit/:id", wrapAsync(async (req, res) => {
  const listingData = await Listing.findById(req.params.id);

  if (!listingData) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  if (!req.isAuthenticated()) {
    req.flash("error", "You must be Logged in to Edit Listing.");
    return res.redirect("/login");
  }

  res.render("edit.ejs", { result: listingData });
}));

router.patch("/edit/:id", isLoggedin, upload.single("image"), wrapAsync(async (req, res) => {
  if (!req.body.title && !req.body.description && !req.body.price && !req.body.location && !req.body.country) {
    throw new ExpressError(400, "Send valid data for your listing");
  }

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country
  };

  if (req.file) {
    updateData.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await Listing.findByIdAndUpdate(req.params.id, updateData);
  req.flash("success", "Listing edited successfully!");
  res.redirect(`/listings/show/${req.params.id}`);
}));

router.delete("/delete/:id", isLoggedin, wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
}));

router.get("/show/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
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
}));

router.post("/:id/reviews", isLoggedin, wrapAsync(async (req, res) => {
  const listingItem = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);

  if (!newReview.comment || !newReview.rating || newReview.rating < 1 || newReview.rating > 5) {
    throw new ExpressError(400, "Send valid review data");
  }

  newReview.owner = req.user._id;
  listingItem.reviews.push(newReview);
  await newReview.save();
  await listingItem.save();

  req.flash("success", "Review created successfully!");
  res.redirect(`/listings/show/${req.params.id}`);
}));

router.delete("/:id/reviews/:reviewid", wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewid } });
  await Review.findByIdAndDelete(req.params.reviewid);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/show/${req.params.id}`);
}));

router.get("/wishlist/:id", isLoggedin, wrapAsync(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, { $push: { wishlist: req.params.id } });
  res.send("on wishlist");
}));

module.exports = router;