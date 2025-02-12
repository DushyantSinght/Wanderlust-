const mongoose = require("mongoose");
const Review = require("./models/reviews");
const Listingschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: { type: String},
        url: { type: String},
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    lat:{
        type: Number
    },
    long:{
        type: Number
    }
});
Listingschema.post("findOneAndDelete",async(Listing)=>{
    if(Listing){
        await Review.deleteMany({_id : {$in: Listing.reviews}});
    };
})
const Listing = mongoose.model("Listing",Listingschema);
module.exports = Listing;