const mongoose=require("mongoose");

const Schema=mongoose.Schema;

const reviewSchema=new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }
})
module.exports=mongoose.model("review",reviewSchema);