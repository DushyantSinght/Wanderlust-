module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        return res.redirect("/login");
    }
    next()
};