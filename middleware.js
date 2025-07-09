module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
    req.flash("error","You must be Loggedin.");
    res.redirect("/listings");
  };next()
}