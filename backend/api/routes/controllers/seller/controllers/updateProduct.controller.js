import { GOOGLE_VISION } from '../../../../config/env.ts';
import vision from '@google-cloud/vision';
import { randomUUID } from 'crypto';
import fs from "fs";

export default async function updateProduct({db, ci, request, reply}) {
     try {
          const userInfo = request.userInfo;

          let product_id = request.query.e; 
          console.log(product_id);

          // ========== ADAPTACIÓN FASTIFY MULTIPART ========== //
          const files = {};
          const fields = {};
          
          try {
               const parts = request.parts();
               for await (const part of parts) {
                    if (part.type === 'file') {
                         files[part.fieldname] = part;
                    } else {
                         fields[part.fieldname] = part.value;
                    }
               }
          } catch (err) {
               return reply.code(400).send({ error: 'Error processing upload: ' + err.message });
          }

          const { title, category, description, price, deliveryUnit, accounts, asset_name, service, image } = fields;
          const asset = files.asset || null;
          // ================================================== //

          let accountsParsed;

          // VALIDATE TITLE
          if (typeof title !== "string" || title.length === 0 || title.length > 42) {
               return reply.code(400).send({ error: "Title is required and must be a string with max 42 characters" });
          }

          if(!files.image && !image){
               return reply.code(400).send({message:'image is required'});
          }

          // VALIDATE CATEGORY
          const validCategories = ["account", "service", "others"];
          if (typeof category !== "string" ||
               !validCategories.includes(category.toLowerCase())) {
               return reply.code(400).send({ error: `Category must be one of: ${validCategories.join(", ")}` });
          }

          // VALIDATE DESCRIPTION
          if (typeof description !== "string") {
               return reply.code(400).send({ error: "Description must be a string" });
          }

          // VALIDATE PRICE
          const price_value = parseInt(price);
          if (price_value <= 0 || price_value > 9999) {
               return reply.code(400).send({ error: "Price must be a positive number" });
          }

          // VALIDATE DELIVERY UNIT
          const deliveryUnit_content = JSON.parse(deliveryUnit);
          if (deliveryUnit_content.type !== "instant" && deliveryUnit_content.type !== "minutes" && deliveryUnit_content.type !== "hours") {
               return reply.code(400).send({ error: `Delivery unit error` });
          }

          // ================================================================================= //
          if(category.toLowerCase()==='account'){
               accountsParsed = JSON.parse(accounts);  
               if (!Array.isArray(accountsParsed) || accountsParsed.length <= 0) {
                    return reply.code(400).send({ error: "Accounts must be a non-empty array" });
               }
          }
          if(category.toLowerCase()==='service'){
               if (typeof(service) !== "string" || service.length < 20) {
                    return reply.code(400).send({ error: "Service must be a text and need have lees of 20 characters" });
               }
          }
          if (category.toLowerCase() === "others" ) {
               if (!asset) {
                         return reply.code(400).send({ error: "Other file required" });
               }

               if (asset.file?.bytesRead > 10 * 1024 * 1024) {
                    return reply.code(400).send({ error: "Asset file too large (max 10MB)" });
               }

               if (!["application/pdf","text/x-python","application/javascript"].includes(asset.mimetype)) {
                    return reply.code(400).send({ error: "Invalid asset file type" });
               }
               if (asset.filename.length < 2 || asset.filename.length > 30) {
                    return reply.code(400).send({ error: "Invalid filename" });
               }
          }
          // ================================================================================= //

          const quantity = accountsParsed?.length? accountsParsed.length : 1 ;

          // Subir la imagen a Cloudinary si se proporciona
          let imageUrl = null;
          let assetUrl = null;

          try {
               if (files.image) {
                    const client = new vision.ImageAnnotatorClient({
                         apiKey:GOOGLE_VISION
                    });
                    
                    const tempPath = `uploads/${randomUUID()}_${files.image.filename}`;
                    await fs.promises.writeFile(tempPath, await files.image.toBuffer());
                    
                    const file = fs.readFileSync(tempPath);
                    const encodedImage = file.toString('base64');

                    const [result_img] = await client.safeSearchDetection({
                         image: { content: encodedImage },
                    });

                    const safeSearch = result_img.safeSearchAnnotation;

                    console.log(safeSearch);

                    if(safeSearch.adult === "VERY_LIKELY" || safeSearch.violence === "VERY_LIKELY" || safeSearch.medical == "VERY_LIKELY" || safeSearch.medical == "LIKELY" ) {
                         await fs.promises.unlink(tempPath);
                         return reply.code(401).send({message:"inappropriate image"});
                    }

                    const result = await ci.uploader.upload(tempPath, {
                         folder: "images",
                    });
                    imageUrl = result.secure_url;
                    
                    await fs.promises.unlink(tempPath);
               }else if(image){
                    imageUrl = image;
               }
               if (files.asset && category.toLowerCase() === 'others') {
                    const assetFile = files.asset;
                    const tempPath = `uploads/${randomUUID()}_${assetFile.filename}`;
                    await fs.promises.writeFile(tempPath, await assetFile.toBuffer());
                    
                    try {
                         const uploadResult = await ci.v2.uploader.upload(tempPath, {
                              folder: "assets",
                              resource_type: "raw",
                              use_filename: true,
                              filename_override: assetFile.filename,
                              unique_filename: false
                         });
                         assetUrl = uploadResult.secure_url;
                         await fs.promises.unlink(tempPath);
                         
                         if(typeof(assetUrl) !== 'string') return reply.code(500).send({error:"Error uploading file, please try later"});
                    } catch (err) {
                         console.error("Cloudinary upload error:", err);
                         return reply.code(500).send({ error: "Cloudinary upload failed", details: err.message });
                    }
               }else if(!files.asset && category.toLowerCase() === 'others'){
                    const query = `
                         SELECT asset_link
                         FROM Product_Asset
                         WHERE product_id = ? AND seller_id = ?
                    `;
                    const rows = await db(query, [product_id, userInfo.id]);

                    assetUrl = rows[0].asset_link;
                    console.log(assetUrl);
                    if(typeof(assetUrl) !== 'string') return reply.code(500).send({error:"Error uploading file, please try later"});
               }
          } catch (err) {
               console.error(err);
               return reply.code(500).send({ error: err });
          }
          console.log(product_id);
          // Actualización del producto en la base de datos usando el pool
          const updateProductQuery = `
               UPDATE Products
               SET title = ?, category = ?, description = ?, price = ?, deliveryUnit = ?, delivery_value = ?, image = ?, quantity = ?
               WHERE product_id = ? AND user_id = ? AND deleted = 0
          `;
          await db(updateProductQuery, [
               title,
               category,
               description,
               price_value,
               deliveryUnit_content.type,
               deliveryUnit_content.value,
               imageUrl || fields.image,
               quantity,
               product_id,
               userInfo.id
          ]);
          console.table({product_id,userInfo,asset_name,assetUrl})
          if(category.toLowerCase() === "account"){
               try {
                    const deleteAccountsQuery = `
                         DELETE FROM Product_Accounts
                         WHERE product_id = ? AND seller_id = ?
                    `;

                    await db(deleteAccountsQuery, [product_id, userInfo.id]);

                    // Luego insertamos las nuevas cuentas
                    const insertAccountQuery = `
                         INSERT INTO Product_Accounts (account_id, product_id, seller_id, information)
                         VALUES (?, ?, ?, ?)
                    `;
                    
                    // Usamos el pool para insertar cuentas
                    for (const account of accountsParsed) {
                         await db(insertAccountQuery, [
                         randomUUID(),
                         product_id,
                         userInfo.id,
                         account.information
                         ]);
                    }

                    return reply.code(200).send({
                         message: 'Product updated successfully',
                         product: {
                         product_id,
                         title,
                         category,
                         description,
                         price,
                         deliveryUnit,
                         image: imageUrl || fields.image,
                         }
                    });
               } catch (err) {
                    console.error('Error updating product or accounts:', err);
                    return reply.code(500).send({ error: `Server error: ${err.message}` });
               }
          }
          if(category.toLowerCase() === "service"){
               try {

                    // Luego insertamos las nuevas cuentas
                    const set_service = `
                         UPDATE Product_Service
                         SET information = ?
                         WHERE product_id = ? AND seller_id = ?
                    `;
                    const r = await db(set_service, [service, product_id, userInfo.id]);
                    if (r.affectedRows === 0) {
                         return reply.code(404).send({ error: "No hay filas para actualizar" });
                    }

                    return reply.code(200).send({
                         message: 'Product updated successfully',
                         product: {
                         product_id,
                         title,
                         category,
                         description,
                         price,
                         deliveryUnit,
                         image: imageUrl || fields.image,
                         }
                    });
               } catch (err) {
                    console.error('Error updating product or accounts:', err);
                    return reply.code(500).send({ error: `Server error: ${err.message}` });
               }
          }
          if(category.toLowerCase() === "others"){
               try {

                    // Luego insertamos las nuevas cuentas
                    const set_asset = `
                         UPDATE Product_Asset
                         SET asset_name = ?, asset_link = ?
                         WHERE product_id = ? AND seller_id = ?
                    `;
                    const r = await db(set_asset, [asset_name, assetUrl, product_id, userInfo.id]);
                    if (r.affectedRows === 0) {
                         return reply.code(404).send({ error: "No hay filas para actualizar" });
                    }

                    return reply.code(200).send({ 
                         message: 'Product updated successfully',
                         product: {
                         product_id,
                         title,
                         category,
                         description,
                         price,
                         deliveryUnit,
                         image: imageUrl || fields.image,
                         }
                    });
               } catch (err) {
                    console.error('Error updating product or accounts:', err);
                    return reply.code(500).send({ error: `Server error: ${err.message}` });
               }
          }
     } catch (err) {
          console.error('Error updating product:', err);
          return reply.code(500).send({ error: `Server error, ${err}` });
     }
}
