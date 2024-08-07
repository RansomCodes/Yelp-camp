const express=require('express');
const router=express.Router({mergeParams: true});

const Campground=require('../models/campground');
const Review=require('../models/review');
const {ValidateReview, isLoggedIn, isReviewAuthor}=require('../middleware');
const catchAsync=require('../utils/catchAsync');
const reviews=require('../controllers/reviews');


router.post('/',isLoggedIn,ValidateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.updateReview));

module.exports=router;