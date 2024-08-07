const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
    // Remember here we can't change the names of the keys.
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'VistaVite_Dev',
      allowedFormats: ["png", "jpg", "jpeg"],
    },
  });

// Few things to remember but most of the code came from npm multer-storage-cloudinary website. 

module.exports={
    cloudinary, 
    storage
}




