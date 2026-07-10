import cloudinary from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from './env.ts';
/**
 * @returns Initialization cloudinary config
 */
cloudinary.v2.config({
     cloud_name: 'dkmcz80mt',
     api_key: CLOUDINARY_API_KEY,
     api_secret: CLOUDINARY_API_SECRET
});
export default cloudinary.v2;
