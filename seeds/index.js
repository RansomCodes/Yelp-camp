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
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*1000)+10;
        const newCamp=new Campground({
            author: '66acd3e95bcee5061cfce72b',
            geometry: {
                type: 'Point',
                coordinates: [ 
                    Cities[random1000].longitude, 
                    Cities[random1000].latitude 
                ]
            },
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                url: 'https://res.cloudinary.com/dwhczlwpx/image/upload/v1722693900/YelpCamp/dmjdip2gcda8mjobxfbg.jpg',
                filename: 'YelpCamp/dmjdip2gcda8mjobxfbg',
              },
              {
                url: 'https://res.cloudinary.com/dwhczlwpx/image/upload/v1722693900/YelpCamp/ylulud8ortvxnjfsshul.jpg',
                filename: 'YelpCamp/ylulud8ortvxnjfsshul',
              },
              {
                url: 'https://res.cloudinary.com/dwhczlwpx/image/upload/v1722693900/YelpCamp/laqlroxrsqtfi9mkmocn.jpg',
                filename: 'YelpCamp/laqlroxrsqtfi9mkmocn',
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