const mongoose=require("mongoose");
const schema=mongoose.Schema;
const review=require("./review")
const listingSchema=new schema({
    title:{
        type:String,
        
    },
    description:{
        type:String
    },
    image:{
        type:String,
        default:"https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set:(v)=> v==="" ? "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
    },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },
    reviews:[
        {
            type:schema.Types.ObjectId,
            ref:"review"
        }
    ],
    owner:{
        type:schema.Types.ObjectId,
        ref:"user"
    },
    geometry:  {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      
    },
    coordinates: {
      type: [Number],
      
    }
  }
    
});
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await review.deleteMany({_id:{$in:listing.reviews}})
    }
})
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;