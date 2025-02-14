const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const {isLoggedIn,validateCampground,isAuthor}=require('../middleware');
const campgrounds=require('../controllers/campground');
const multer  = require('multer');
const { storage }=require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.newCampground))
    
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.viewCampground))
    .put(isLoggedIn,isAuthor, upload.array('image'), validateCampground,catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditCampground));


module.exports=router;