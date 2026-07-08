import cloudinary from 'cloudinary';

export default cloudinary.v2.config({
     cloud_name: 'dkmcz80mt',
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});
