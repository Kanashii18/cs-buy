import { randomUUID } from 'crypto';
import vision from '@google-cloud/vision';
import fs from "fs";

// llamar modulos utiles desde el codigo barril
import { log } from '../../modules/index.js';
import dotenv from 'dotenv';
dotenv.config();

// ELIMINADO: import multer from 'multer';
const logger = log('seller.product.controller.js');

export function gestionProduct(db, ci) {
    return {
          addProduct: async (request, reply) => {
               try {
                    const userInfo = request.userInfo;

                    const ALLOWED_IMAGE = new Set([
                         "image/jpeg",
                         "image/png",
                         "image/gif",
                         "image/bmp",
                         "image/jpg",
                         "image/webp",
                    ]);

                    const ALLOWED_ASSET = new Set([
                         "application/pdf",
                         "text/x-python",
                         "application/javascript",
                    ]);

                    const VALID_CATEGORIES = new Set(["account", "service", "others"]);
                    const parts = request.parts();
                    const body = {};
                    let image = null;
                    let asset = null;

                    for await (const part of parts) {
                         if (part.type === "file") {
                              const fileBuffer = await part.toBuffer(); // <-- CLAVE: consume el stream
                              console.log("FILE:", part.fieldname, part.mimetype, "bytes:", fileBuffer?.length);
                              if (!fileBuffer || fileBuffer.length === 0) {
                                   return reply.code(400).send({ error: `${part.fieldname} is empty (0 bytes)` });
                              }
                              if (part.fieldname === "image") {
                                   image = {
                                        buffer: fileBuffer,
                                        mimetype: part.mimetype,
                                        filename: part.filename || part.originalFilename || "image",
                                   };
                              } else if (part.fieldname === "asset") {
                                   asset = {
                                        buffer: fileBuffer,
                                        mimetype: part.mimetype,
                                        filename: part.filename || part.originalFilename || "asset",
                                   };
                              }
                         } else {
                              body[part.fieldname] = part.value;
                         }
                    }

                    if (!image) return reply.code(400).send({ error: "image is required" });
                    if (!ALLOWED_IMAGE.has(image.mimetype)) {
                         return reply.code(400).send({ error: `Unsupported image type: ${image.mimetype}. Please upload Other Type.` });
                    }

                    const { title, category, description, price, deliveryUnit, accounts, service } = body;

                    if (typeof title !== "string" || title.length === 0 || title.length > 42) {
                         return reply.code(400).send({ error: "Title is required and must be a string with max 42 characters" });
                    }

                    if (typeof category !== "string" || !VALID_CATEGORIES.has(category.toLowerCase())) {
                         return reply.code(400).send({ error: `Category must be one of: ${Array.from(VALID_CATEGORIES).join(", ")}` });
                    }

                    if (typeof description !== "string") {
                         return reply.code(400).send({ error: "Description must be a string" });
                    }

                    const priceNumber = Number(price);
                    if (!Number.isFinite(priceNumber) || price < 1 || price > 9999) {
                         return reply.code(400).send({ error: "Invalid price" });
                    }

                    let deliveryUnitContent;
                    try {
                         deliveryUnitContent = JSON.parse(deliveryUnit);
                    } catch {
                         return reply.code(400).send({ error: "deliveryUnit must be valid JSON" });
                    }

                    if (!["instant", "minutes", "hours"].includes(deliveryUnitContent?.type)) {
                         return reply.code(400).send({ error: "Delivery unit error" });
                    }

                    let accountsParsed = null;

                    if (category.toLowerCase() === "account") {
                         try {
                              accountsParsed = JSON.parse(accounts);
                         } catch {
                              return reply.code(400).send({ error: "accounts must be valid JSON" });
                         }

                         if (!Array.isArray(accountsParsed) || accountsParsed.length === 0) {
                              return reply.code(400).send({ error: "Accounts must be a non-empty array" });
                         }
                    }

                    if (category.toLowerCase() === "service") {
                         if (typeof service !== "string" || service.length < 20) {
                              return reply.code(400).send({ error: "Service must be a text and need have lees of 20 characters" });
                         }
                    }
                    
                    const quantity = (Array.isArray(accountsParsed) && accountsParsed.length > 0) ? accountsParsed.length : 1;

                    const product_id = randomUUID();
                    let imageUrl = null;
                    let assetUrl = null;

                    try {
                         const uploadToCloudinary = (buffer, options) =>
                              new Promise((resolve, reject) => {
                              const up = ci.v2.uploader.upload_stream(options, (err, result) => {
                                   if (err) reject(err);
                                   else resolve(result);
                              });
                              up.end(buffer);
                         });

                         const imageRes = await uploadToCloudinary(image.buffer, {
                              folder: "images",
                              resource_type: "image",
                              public_id: product_id,
                         });

                         imageUrl = imageRes?.secure_url || imageRes?.url || null;
                         if (!imageUrl) return reply.code(500).send({ error: "Cloudinary image upload failed" });

                         if (asset && category.toLowerCase() === "others") {
                              const assetRes = await uploadToCloudinary(asset.file, {
                                   folder: "assets",
                                   public_id: `${product_id}-asset`,
                                   resource_type: "raw",
                              });

                              assetUrl = assetRes?.secure_url || assetRes?.url || null;
                              if (!assetUrl) return reply.code(500).send({ error: "Cloudinary asset upload failed" });
                         }
                    } catch (e) {
                         return reply.code(500).send({ error: "Cloudinary upload failed", details: e?.message });
                    }

                    const insertProduct = `
                         INSERT INTO Products (
                              product_id, user_id, title, price, deliveryUnit, delivery_value, quantity, image, category, description
                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    await db(insertProduct, [
                         product_id,
                         userInfo.id,
                         title,
                         priceNumber,
                         deliveryUnitContent.type,
                         deliveryUnitContent.value,
                         quantity,
                         imageUrl,
                         category,
                         description,
                    ]);

                    if (category.toLowerCase() === "account") {
                         const insertAccounts = `
                              INSERT INTO Product_Accounts (
                                   account_id, product_id, seller_id, information
                              ) VALUES (?, ?, ?, ?)
                         `;

                         for (const account of accountsParsed) {
                              const info = account?.content;
                              if (typeof info !== "string" || info.length === 0) {
                                   return reply.code(400).send({ error: "Each account must have content" });
                              }

                              await db(insertAccounts, [
                                   randomUUID(),
                                   product_id,
                                   userInfo.id,
                                   info,
                              ]);
                         }
                    }

                    if (category.toLowerCase() === "service") {
                         const insertService = `
                              INSERT INTO Product_Service (
                                   service_id, product_id, seller_id, information
                              ) VALUES (?, ?, ?, ?)
                         `;

                         await db(insertService, [
                              randomUUID(),
                              product_id,
                              userInfo.id,
                              service,
                         ]);
                    }

                    if (category.toLowerCase() === "others") {
                         const insertAsset = `
                              INSERT INTO Product_Asset (
                                   asset_id, asset_name, product_id, seller_id, asset_link
                              ) VALUES (?, ?, ?, ?, ?)
                         `;

                         const assetName =
                              (asset?.filename || asset?.originalFilename || "").trim() ||
                              "asset";

                         await db(insertAsset, [
                              randomUUID(),
                              assetName,
                              product_id,
                              userInfo.id,
                              assetUrl,
                         ]);
                    }

                    return reply.code(200).send({
                         message: "Product added successfully",
                         product: {
                              product_id,
                              user_id: userInfo.id,
                              title,
                              price: priceNumber,
                              quantity,
                              category,
                              description,
                              deliveryUnit: deliveryUnitContent,
                              image: imageUrl,
                              asset: assetUrl,
                         },
                    });
               } catch (e) {
                    return reply.code(500).send({ error: `Server error, ${e?.message || e}` });
               }
          },

          // =============== Modify Products =============== //
          updateProduct: async (request, reply) => {
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
                                   apiKey:process.env.GOOGLE_VISION
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
          },
          // =============== Get all Products =============== //
          /**
           * Fetches all products from the database.
           */
          getModifyProduct: async (request, reply) => {
               const product_id = request.query.e;
               const userInfo = request.userInfo;
               try {
                    const query = `
                         SELECT 
                              title,
                              price,
                              deliveryUnit,
                              delivery_value,
                              image,
                              category,
                              quantity,
                              description
                         FROM Products
                         WHERE user_id = ? AND product_id = ? AND deleted = 0
                    `;
                    const products = await db(query, [userInfo.id, product_id]);

                    if (products.length === 0) {
                         return reply.code(404).send({ error: 'Product not found' });
                    }

                    let result;
                    console.log(products[0].category);
                    if(products[0].category.toLowerCase() === 'account'){

                         
                         console.log(products[0].quantity);
                         const qty = Number.isInteger(products[0].quantity)
                              ? products[0].quantity
                              : 0;

                         const query_account = `
                              SELECT information, account_id
                              FROM Product_Accounts
                              WHERE product_id = ?
                              ORDER BY account_id
                              LIMIT ${qty}
                         `;

                         const raw = await db(query_account, [product_id]);

                         // Normalizar a array de objetos
                         let rows;
                         if (Array.isArray(raw)) {
                              // Caso: driver devuelve [rows, fields] -> raw[0] es el array de filas
                              if (raw.length > 0 && Array.isArray(raw[0])) {
                                   rows = raw[0];
                              } else {
                                   // Caso: driver devuelve directamente rows (array) o un array de 1 objeto
                                   rows = raw;
                              }
                         } else if (raw && typeof raw === "object") {
                              // Caso: devuelve un único objeto (una fila)
                              rows = [raw];
                         } else {
                              rows = []; // null/undefined/otro
                         }

                         // Ahora rows es siempre un array de objetos
                         console.log("rows isArray?", Array.isArray(rows), "length:", rows.length);
                         console.log(rows);
                         
                         result = {
                              title: products[0].title,
                              price: products[0].price,
                              image: products[0].image,
                              deliveryUnit: products[0].deliveryUnit,
                              delivery_value: products[0].delivery_value,
                              category: products[0].category,
                              quantity: products[0].quantity,
                              description: products[0].description,
                              service_msg: "",
                              asset_name:"",
                              accounts: rows
                         };
                    }
                    else if(products[0].category.toLowerCase() === 'service'){
                         const query_account = `
                              SELECT 
                                   information, service_id
                              FROM Product_Service
                              WHERE product_id = ?
                         `;
                         const content = await db(query_account, [product_id]);
                         result = {
                              title: products[0].title,
                              price: products[0].price,
                              image: products[0].image,
                              deliveryUnit: products[0].deliveryUnit,
                              delivery_value: products[0].delivery_value,
                              category: products[0].category,
                              quantity: products[0].quantity,
                              description: products[0].description,
                              service_msg: content[0].information,
                              asset_name: "",
                              accounts:[]
                         };
                    }
                    else if(products[0].category.toLowerCase() === 'others'){
                         const query_account = `
                              SELECT 
                                   asset_name, asset_id
                              FROM Product_Asset
                              WHERE product_id = ?
                         `;
                         const content = await db(query_account, [product_id]);
                         console.log(content);
                         result = {
                              title: products[0].title,
                              price: products[0].price,
                              image: products[0].image,
                              deliveryUnit: products[0].deliveryUnit,
                              delivery_value: products[0].delivery_value,
                              category: products[0].category,
                              quantity: products[0].quantity,
                              description: products[0].description,
                              asset_name: content[0].asset_name,
                              service_msg: "",
                              accounts:[]
                         };
                    }
                    
                    reply.code(200).send(result);

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    logger.log(`Error getting products: ${error.message}`, 'error');
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },

          // =============== Get Products =============== //
          /**
           * Fetches all products from the database.
           */
          getProduct: async (request, reply) => {
               const text = request.body.text;
               const category = request.body.category;
               const lowestPrice = request.body.min_price;
               const highestPrice = request.body.max_price;

               try {
                    const query  = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.quantity,
                              p.active,
                              p.image,
                              p.description,
                              u.username AS seller_name,
                              u.rate AS seller_rate 
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE p.quantity > 0 AND p.active = True AND p.deleted = 0
                         AND p.price BETWEEN ? AND ?
                         ${category !== "any" ? "AND p.category = ?" : ""}
                         ${text ? "AND p.title LIKE ?" : ""}
                         ;
                    `
                    const config = [
                         Number(lowestPrice),
                         Number(highestPrice),
                         ...(category !== "any" ? [category[0].toUpperCase() + category.slice(1)] : []),
                         ...(text != null ? [`%${text}%`] : []),
                    ];
                                        
                    // add price condition...
                    console.log(query,config);
                    const products = await db(query, config);

                    return reply.code(200).send(products);

               } catch (error) {
                    console.error('\n\n\n\nError getting products:', error,"\n\n\n\n");
                    logger.log(`Error getting products: ${error.message}`, 'error');
                    return reply.code(500).send({ error: 'Error getting products' });
               }
          },
           // =============== Pause Products =============== //
          /**
           * Pause product by click pause
           */
          pause: async (request, reply) => {
               const { product_id } = request.body;
               const userInfo = request.userInfo;
               try {
                    const query = `
                         UPDATE Products
                         SET active = FALSE
                         WHERE product_id = ? AND user_id = ? AND deleted = 0;
                    `;
                    const pause = await db(query,[product_id, userInfo.id]);
                    if (pause.affectedRows > 0) {
                         reply.code(200).send("OK");
                    } else {
                         reply.code(500).send("BAD");
                    }

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          resume: async (request, reply) => {
               const { product_id } = request.body;
               const userInfo = request.userInfo;
               try {
                    const query = `
                          UPDATE Products
                          SET active = TRUE
                          WHERE product_id = ? AND user_id = ? AND deleted = 0;
                    `;
                    const pause = await db(query, [product_id, userInfo.id]);
                    if (pause.affectedRows > 0) {
                         reply.code(200).send("OK");
                    } else {
                         reply.code(500).send("BAD");
                    }

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          // =============== Delete Product =============== //
          /**
           * Deletes a product from the database.
           * The user must be authenticated and the owner of the product.
           */
          remove: async (request, reply) => {
               const { product_id } = request.body;
               const userInfo = request.userInfo;
               try {
                    const query = `
                         UPDATE Products
                         SET deleted = 1
                         WHERE product_id = ? AND user_id = ? AND deleted = 0;
                    `;

                    const result = await db(query, [product_id, userInfo.id]);
                    if (result.affectedRows > 0) {
                    reply.code(200).send("OK");
                    } else {
                    reply.code(404).send("NOT_FOUND");
                    }
               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          // =============== Get Nav Product =============== //
          /**
           * Get products for the top bar.
           */
          getNav_Product: async (request, reply) => {    
               const searchTerm = request.query.product; // Obtiene el término de búsqueda
               const sql = `
                    SELECT product_id, title, price, image, category
                    FROM Products 
                    WHERE title LIKE ? AND quantity > 0 AND deleted = 0
                    ORDER BY CHAR_LENGTH(title) - CHAR_LENGTH(REPLACE(title, ?, '')) DESC 
                    LIMIT 10
               `;
               const values = [`%${searchTerm}%`, searchTerm];

               try {
                    const results = await db(sql, values);
                    reply.send(results); // Devuelve los resultados de la búsqueda
               } catch (err) {
                    console.error(err);
                    return reply.code(500).send({ error: 'Error al realizar la búsqueda' });
               }
          },
          // =============== Get Single Product =============== //
          /**
           * Fetches a single product by its ID.
           */
          getProductById: async (request, reply) => {
               
               const product_id = request.query.product_id;
               if (!product_id) {
                    return reply.code(400).send({ error: 'Missing product_id in query' });
               }

               try {
                    const query = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.deliveryUnit,
                              p.delivery_value,
                              p.quantity,
                              p.image,
                              p.description,
                              u.username AS seller_name,
                              u.rate AS seller_rate 
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE p.product_id = ? AND p.quantity > 0 AND p.deleted = 0;
                    `;
                    
                    const product = await db(query, [product_id]);

                    if (product.length === 0) {
                         return reply.code(404).send({ error: 'Product not found' });
                    }

                    reply.code(200).send(product[0]);

               } catch (error) {
                    console.error('Error getting product:', error.message);
                    reply.code(500).send({ error: 'Error getting product' });
               }
          },
          // =============== Get Products by User =============== //
          /**
           * Fetches products added by the authenticated user.
           */
          getProductSelf: async (request, reply) => {
               const userInfo = request.userInfo;

               try {

                    const stmt = `
                          SELECT
                                category,
                                product_id,
                                title,
                                price,
                                created_at,
                                active,
                                quantity,
                                image,
                                deleted
                          FROM Products 
                          WHERE user_id = ? AND deleted = 0`;
                    const products = await db(stmt, [userInfo.id]);
                    reply.code(200).send(products);

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          getAccounts: async (request, reply) => {
               try {
                    const query = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.quantity,
                              p.image,
                              p.description,
                              u.username AS seller_name,
                              u.rate AS seller_rate 
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE category = 'Account' AND p.quantity > 0 AND p.deleted = 0; 
                    `;

                    const products = await db(query);

                    reply.code(200).send(products);

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          getServices: async (request, reply) => {
               try {
                    const query = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.quantity,
                              p.image,
                              p.description,
                              u.username AS seller_name,
                              u.rate AS seller_rate 
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE category = 'Service' AND p.quantity > 0 AND p.deleted = 0; 
                    `;

                    const products = await db(query);

                    reply.code(200).send(products);

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
          getAssets: async (request, reply) => {
               try {
                    const query = `
                         SELECT 
                              p.product_id,
                              u.user_id,
                              p.title,
                              p.price,
                              p.category,
                              p.quantity,
                              p.image,
                              p.description,
                              u.username AS seller_name,
                              u.rate AS seller_rate 
                         FROM Products p
                         JOIN Users u ON p.user_id = u.user_id
                         WHERE category = 'Assets' AND p.quantity > 0 AND p.deleted = 0; 
                    `;

                    const products = await db(query);

                    reply.code(200).send(products);

               } catch (error) {
                    console.error('Error getting products:', error.message);
                    reply.code(500).send({ error: 'Error getting products' });
               }
          },
     };
}
