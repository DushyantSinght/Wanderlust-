const express = require("express");
const app = express();
let port = 9000;
app.listen(port,(req,res)=>{
    console.log("server working")
});
// app.use((req,res,next)=>{
//     console.log(req.method, req.hostname, req.path);
//     next();
// })
// app.use("/api",(req,res,next)=>{
//     let {token} = req.query;
//     if(token === "giveaccess"){
//         next()
//     }
//     else{
//         res.send("ACCESS DENIED")
//     }
// });
let checkToken = (req,res,next)=>{
    let {token} = req.query;
    if(token === "giveaccess"){
        next()
    }
    else{
        res.send("ACCESS DENIED")
    }
};
app.get("/api",checkToken,(req,res)=>{
    res.send("data")
});
// first it will got to /api as req then it will go to checktoken as middleware if if acces is accepted it will send res if not it will deny
app.get("/",(req,res)=>{
    res.send("Working")
});
app.get("/err",(req,res)=>{
    abcd=abcd
});
app.use("/err",(err,req,res,next)=>{
    console.log("------ERROR-------1")
    next(err)
})
app.use("/err",(err,req,res,next)=>{
    console.log("------ERROR-------2")
    next(err)
})
//  end of page if page not found
app.use((req,res)=>{
    res.send("page not found");
})