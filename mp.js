const express = require("express");
const app = express();
const port = 5500;
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
const ejsmate = require("ejs-mate");
app.engine("ejs",ejsmate);
const mongoose = require('mongoose');
const {listingSchema} = require("./schema");
const {reviewSchema} = require("./schema");
const Listing = require("./listing");
const Review = require("./reviews");
const passport = require("passport");
const flash = require('express-flash');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStratergy = require("passport-local");
const User = require("./user")
const {isLoggedin} = require("./middleware");
if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
    console.log("DB URL:", process.env.ATLASDB_URL);
}
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASDB_URL;
main()
    .then(()=>{
    console.log("connection successful")
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);
};
app.listen(port,()=>{
    console.log("Server is on")
});
//to store seesion information  in cloud atlas instead of own laptop 
const store = MongoStore.create(
    {
        mongoUrl: dburl,
        crypto:{
            secret : process.env.SECRET,
        },
        touchAfter: 24*3600,
    }
);
store.on("error",()=>{
    console.log("Error in mongo session store ", err);
})
const sessionOptions ={
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires : Date.now()+ 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    },
};
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.currUser = req.user;// to use req.user in ejs we need to res.locals in middleware
    next()
});
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport uses this
    next();
});
app.get("/demo",async (req,res)=>{
    let fakeUser= new User({
        email : "student@gmail.com",
        username: "student1"
    });
    let registeredUser = await User.register(fakeUser,"Helloworld");
    res.send(registeredUser);
});
// app.get("/",(req,res) => {
//     res.send("server working well!")
// });
app.get("/listing",async (req,res)=>{
    let alllisting = await Listing.find()
    res.render("listing.ejs",{alllisting});
});
app.get("/listingg",isLoggedin,async (req,res)=>{
    res.render("newf.ejs");
});
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        res.send("there was a error");
    } else {
        next();
    }
};
app.post("/listing",async (req,res)=>{
    let {title,description,image,price,country,location,latitude,longitude} = req.body;
    let userId = req.user._id;
    let fdata1 = new Listing({
        title : title,
        description: description,
        price: price,
        image: { url: image },
        country: country,
        location: location,
        owner : userId,
        lat: latitude,
        long: longitude
    })
    await fdata1.save()
    .then((res)=>{
        console.log(res)
    })
    .catch((err)=>{
        console.log(err)
    })
    res.redirect("/listing")
});
app.get("/listing/:id",async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    console.log(listing);
    res.render("show.ejs",{listing});
});
app.get("/listing/:id/edit",isLoggedin,async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    res.render("editf.ejs",{listing})
});
app.put("/listing/:id",isLoggedin,async (req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{title,description,price,country,location});
    res.send("working")
});
app.delete("/listing/:id",isLoggedin,async (req,res)=>{
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listing");
});

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        res.send("there was a error");
    } else {
        next();
    }
};
app.post("/listing/:id/review",isLoggedin,async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${listing.id}`);
    console.log("new review saved");
});
app.delete("/listing/:id/reviews/:reviewid",isLoggedin,async(req,res)=>{
    let {id,reviewid}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/listing/${id}`);
});
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});
app.post("/signup",async (req,res)=>{
    let {username,email,password} = req.body;
    let User1= new User({email,username});
    const registeredUser = await User.register(User1,password);
    console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/listing")
    });
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.post("/login",
    passport.authenticate("local",{failureRedirect: "/login",failureFlash:true}),
    async(req,res)=>{
        res.redirect("/listing");
    }
);
app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/listing");
    });
});