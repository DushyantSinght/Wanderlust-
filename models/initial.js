const mongoose = require('mongoose');
const Listing = require("./listing");
const indata = require("../models/sdata")
main()
    .then(()=>{
    console.log("connection successful")
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
};
const init = async()=>{
    await Listing.deleteMany({});
    indata.data=indata.data.map((obj)=>({...obj,owner : "67a744f8d791f763a624ecf0"}));
    await Listing.insertMany(indata.data);
    console.log("data was initialized")
};
init();