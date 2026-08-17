const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log("Cloudinary config loading:", {
  cloudName: process.env.CLOUD_NAME,
  hasApiKey: Boolean(process.env.CLOUD_API_KEY),
  hasApiSecret: Boolean(process.env.CLOUD_API_SECRET),
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dermaScan-uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage,
});

module.exports = upload;

// const storage =  multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,path.join(__dirname,"../../uploads"));

//     },
//     filename:(req,file,cb)=>{
//        const uniqueName = Date.now()+"-"+Math.round(Math.random()*1e9)+path.extname(file.originalname);
//        cb(null,uniqueName);
//     }
// });

// const upload = multer ({
//     storage:storage
// });

// module.exports = upload;
