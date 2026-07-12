import fs from 'fs';

export default async function({ ci, request, reply }) {
     const imagePath = request.file.path;
     const model = await loadModel();
     const predictions = await analyzeImage(imagePath, model);
     console.log('Predicciones de moderación:', predictions);

     const isNSFW = predictions[0].className === 'Porn' || predictions[0].className === 'Hentai';

     if (isNSFW) {
          return reply.status(400).send({ message: 'Imagen inapropiada detectada' });
     }

     try {
          const uploadResult = await ci.uploader.upload(imagePath, {
               folder: 'imagen_set',
          });
          fs.unlinkSync(imagePath);

          return reply.send({
               message: 'Imagen aprobada y subida a Cloudinary',
               secure_url: uploadResult.secure_url,
          });
     } catch (uploadError) {
          console.error('Error al subir la imagen a Cloudinary:', uploadError);
          return reply.status(500).send({ message: 'Error al subir la imagen a Cloudinary' });
     }
}
