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
    image: {
  url: String,
  filename: String
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