const mongoose=require("mongoose");
const initdata=require("./data.js");
const listing=require("../models/listing.js");
main()
.then(()=>{
    console.log("Connection sucessfull")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

const initialize=async()=>{
    await listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:"686a9c7ac7f1aade50a11764"}));
    await listing.insertMany(initdata.data);
    console.log("initialized")
}
initialize();