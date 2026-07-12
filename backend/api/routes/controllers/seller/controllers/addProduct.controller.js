import { randomUUID } from 'crypto';

export default async function({db, ci, request, reply}) {
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
}
