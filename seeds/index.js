const mongoose=require('mongoose'); 
const Campground=require('../models/campground');
const Cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample=(array)=>{
    return array[Math.floor(Math.random()*array.length)];
};

const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000=Math.floor(Math.random()*162);
        const price=Math.floor(Math.random()*1000)+10;
        const newCamp=new Campground({
            author: '66ad1371f894c08dd4e93ef7',
            geometry: {
                type: 'Point',
                coordinates: [ 
                    Cities[random1000].lng, 
                    Cities[random1000].lat 
                ]
            },
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                url: 'http://res.cloudinary.com/dwhczlwpx/image/upload/v1723281019/wPCyys8TPCHY3GXm2N2D_ssp_inthewoods_1_lgtfwn.avif',
                filename: 'wPCyys8TPCHY3GXm2N2D_ssp_inthewoods_1_lgtfwn',
              },
              {
                url: 'http://res.cloudinary.com/dwhczlwpx/image/upload/v1723281016/photo-1421789665209-c9b2a435e3dc_n6xf3n.avif',
                filename: 'photo-1421789665209-c9b2a435e3dc_n6xf3n',
              },
              {
                url: 'http://res.cloudinary.com/dwhczlwpx/image/upload/v1723281011/photo-1542273917363-3b1817f69a2d_fjzby4.avif',
                filename: 'photo-1542273917363-3b1817f69a2d_fjzby4',
              }],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab quis officia tenetur mollitia sunt commodi doloremque ad in nostrum facere consectetur, veniam assumenda enim odio. Accusamus neque harum corporis nobis, quam quasi suscipit, delectus velit corrupti eaque ab sed atque autem natus molestiae dignissimos doloremque esse. Voluptas dignissimos magni repudiandae.',
            price: price,
        })
        await newCamp.save();
    }
}


seedDB().then(()=>{
    mongoose.connection.close();
});