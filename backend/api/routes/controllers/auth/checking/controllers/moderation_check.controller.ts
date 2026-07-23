import fs from 'fs';
import type { Filter } from '../../../../../types/config_types/filter.type.ts';
import type { FastifyReply } from 'fastify';
import type { UploadRequest } from '../../../../../types/request.type.ts';
import { loadModel } from './filter/load_model.ts';
import { analyzeImage } from './filter/analyze_image.ts';

export default async function({ ci, request, reply } : {ci:Filter, request: UploadRequest, reply: FastifyReply} ) : Promise<void> {
     try{
          const imagePath = request.file?.path;
          if(!imagePath) {
               return await reply.code(400).send("Image not recived");
          }
          const model = await loadModel();
          const predictions = await analyzeImage(imagePath, model);
          console.log('Predicciones de moderación:', predictions);

          const isNSFW = predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';

          if (isNSFW) {
               return await reply.status(400).send({ message: 'Imagen inapropiada detectada' });
          }

          try {
               const uploadResult = await ci.uploader.upload(imagePath, {
                    folder: 'imagen_set',
               });
               fs.unlinkSync(imagePath);

               return await reply.send({
                    message: 'Imagen aprobada y subida a Cloudinary',
                    secure_url: uploadResult.secure_url,
               });
          } catch (uploadError) {
               console.error('Error uploading image', uploadError);
               return await reply.status(500).send({ message: 'Error uploading image' });
          } 
     } catch (err) {
          console.error(err);
          return await reply.status(500).send({ error: 'Internal server error' });
     }
     
}
