const User=require('../models/user');

module.exports.renderRegisterForm=(req,res)=>{
    res.render('auth/register');
};

module.exports.register=async (req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        const registeredUser=new User({email,username});
        await User.register(registeredUser,password);
        req.login(registeredUser,err=>{
            if(err) return next(err); 
            req.flash('success','Welcome to YelpCamp');
            res.redirect('/campgrounds');
        });
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render('auth/login')
};

module.exports.login=(req,res)=>{
    req.flash('success','Welcome Back!!');
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};