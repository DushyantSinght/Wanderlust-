const mongoose = require("mongoose");
const Reviewschema = new mongoose.Schema({
    title: String,
    description: String,
    rating: {
        type: Number,
        min:1,
        max:5
    },
    created_at:{
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});
let Review = new mongoose.model("Review",Reviewschema);
module.exports = Review;