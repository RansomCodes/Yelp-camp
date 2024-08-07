const Campground=require('../models/campground');
const { cloudinary }=require('../cloudinary');
const maptilerClient= require('@maptiler/client');
maptilerClient.config.apiKey=process.env.MAPTILER_API_KEY;

module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
};

module.exports.newCampground=async (req,res,next)=>{
    const geoData=await maptilerClient.geocoding.forward(req.body.campground.location,{limit: 1});
    const newCamp=new Campground(req.body.campground);
    newCamp.geometry=geoData.features[0].geometry;
    newCamp.images=req.files.map(f=> ({
        url:f.path,
        filename: f.filename, 
    }));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success','Successfully made a new Campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.renderEditCampground=async (req,res)=>{
    const { id }= req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find that Campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
};

module.exports.editCampground=async (req,res)=>{
    const { id }=req.params;
    const newCamp=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const images=req.files.map(f=> ({
        url:f.path,
        filename: f.filename, 
    }));
    newCamp.images.push(...images);
    await newCamp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await newCamp.updateOne({ $pull: { images : { filename : { $in : req.body.deleteImages }}}});
    }
    req.flash('success','Successfully edited Campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.viewCampground=async (req,res)=>{
    const { id }=req.params;
    const campground= await Campground.findById(id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that Campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{ campground});
};

module.exports.deleteCampground=async (req,res)=>{
    const { id }=req.params;
    const campground=await Campground.findById(id);
    if(!campground)
    {
        req.flash('error','Cannot find that Campground');
        res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted the campground!');
    res.redirect('/campgrounds');
};