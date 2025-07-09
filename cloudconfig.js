// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('@fluidjs/multer-cloudinary');

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'wanderlust_dev',
//      allowed_formats: ['jpg', 'png', 'jpeg'],
  
//   },
// });
// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const { multerCloudinary } = require('@fluidjs/multer-cloudinary');

// cloudinary.config({
//    cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });

// const upload = multer({
//   storage: multerCloudinary(cloudinary, {
//     folder: 'Wanderlust',
//     allowedFormats: ['jpeg', 'png', 'jpg'],
//   }),
// });

// module.exports={cloudinary,storage};
// cloudconfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_dev',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const multer = require('multer');
const upload = multer({ storage });

module.exports = { cloudinary, storage, upload };
