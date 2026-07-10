import type {
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import type { UploadFile } from "../types/modules/images.type.ts";
import ci from "../config/filter.ts";

const uploadToCloudinary = (
     buffer: Buffer,
     options: UploadApiOptions
): Promise<UploadApiResponse> =>
     new Promise((resolve, reject) => {
     const stream = ci.uploader.upload_stream(
          options,
          (error : unknown, result : UploadApiResponse) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary returned no result"));

          resolve(result);
          }
     );
     stream.end(buffer);
});
const image =  {
          put: async (file: UploadFile): Promise<{ id: string; url: string; originalUrl: string }> => {
               const result = await uploadToCloudinary(file.buffer, {
                    folder: "images",
                    resource_type: "image",
               });

               return {
                    id: result.public_id,
                    url: result.secure_url,
                    originalUrl: result.secure_url,
               };
          },
     }
export default image; 

