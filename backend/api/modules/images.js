import cloudinary from 'cloudinary';
import multer from 'multer';

cloudinary.v2.config({
     cloud_name: 'dkmcz80mt',
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: "uploads/" }).fields([
     { name: "image", maxCount: 1 },
     { name: "asset", maxCount: 1 }
]);


export default function images() {
     return {
          put: async (file, callback) => {
               try {
                    upload(req,res, async(err)=>{
                         if(err) return callback(error);
                    })
                    
                    const response = {
                         id: result.id,
                         url: result.url_preview || result.url_file,
                         originalUrl: result.url_file,
                    };

                    callback(null, response);
               } catch (error) {
               callback(error);
               }
          }
     };
};
