import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("@google-cloud/vision", () => ({
    default: {
        ImageAnnotatorClient: jest.fn(() => ({
            safeSearchDetection: jest.fn().mockResolvedValue([
                {
                    safeSearchAnnotation: {
                        adult: "VERY_UNLIKELY",
                        violence: "VERY_UNLIKELY",
                        medical: "VERY_UNLIKELY"
                    }
                }
            ])
        }))
    }
}));

jest.unstable_mockModule("../../../modules/index.js", () => ({
    log: jest.fn(() => ({
        log: jest.fn()
    }))
}));

const { gestionProduct } = await import("../seller.product.controller.js");

const createReply = () => ({
    statusCode: null,
    payload: null,

    code: jest.fn(function (status) {
        this.statusCode = status;
        return this;
    }),

    send: jest.fn(function (data) {
        this.payload = data;
        return this;
    })
});

const createRequest = (overrides = {}) => ({
    body: {},
    query: {},
    userInfo: {
        id: 1
    },
    parts: createParts([]),
    ...overrides
});

const runHelper = async (overrides = {}) => {
    const reply = createReply();
    const request = createRequest(overrides);

    return { reply, request };
};

const createTextPart = (fieldname, value) => ({
    type: "field",
    fieldname,
    value
});

const createFilePart = ({
    fieldname = "image",
    mimetype = "image/png",
    filename = "file.png",
    buffer = Buffer.from("fake-file")
} = {}) => ({
    type: "file",
    fieldname,
    mimetype,
    filename,
    file: {
        bytesRead: buffer.length
    },
    toBuffer: jest.fn().mockResolvedValue(buffer)
});

const createParts = (parts = []) => {
    return async function* partsGenerator() {
        for (const part of parts) {
            yield part;
        }
    };
};

const validDeliveryUnit = JSON.stringify({
    type: "instant",
    value: 0
});

const validProductFields = ({
    title = "Valid product",
    category = "account",
    description = "Valid description",
    price = "100",
    deliveryUnit = validDeliveryUnit,
    accounts = JSON.stringify([{ content: "account-content-1" }]),
    service = "This is a valid service description",
    asset_name = "asset.pdf",
    image = "https://image.test/current.png"
} = {}) => [
    createTextPart("title", title),
    createTextPart("category", category),
    createTextPart("description", description),
    createTextPart("price", price),
    createTextPart("deliveryUnit", deliveryUnit),
    createTextPart("accounts", accounts),
    createTextPart("service", service),
    createTextPart("asset_name", asset_name),
    createTextPart("image", image)
];

const createCi = () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn((options, callback) => ({
                end: jest.fn(() => {
                    callback(null, {
                        secure_url: options.resource_type === "raw"
                            ? "https://cloudinary.test/asset.pdf"
                            : "https://cloudinary.test/image.png"
                    });
                })
            })),
            upload: jest.fn().mockResolvedValue({
                secure_url: "https://cloudinary.test/asset.pdf"
            })
        }
    },
    uploader: {
        upload: jest.fn().mockResolvedValue({
            secure_url: "https://cloudinary.test/image.png"
        })
    }
});

const findDbCall = (db, text) => {
    return db.mock.calls.find(([query]) => query.includes(text));
};

let consoleLogSpy;
let consoleErrorSpy;
let consoleTableSpy;

beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleTableSpy = jest.spyOn(console, "table").mockImplementation(() => {});
});

afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleTableSpy.mockRestore();
});

describe("addProduct", () => {
    test("responde 400 si no se envía imagen", async () => {
        const { reply, request } = await runHelper({
            parts: createParts(validProductFields())
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "image is required"
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 400 si la imagen está vacía", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image", buffer: Buffer.from("") }),
                ...validProductFields()
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "image is empty (0 bytes)"
        });
    });

    test("responde 400 si la imagen tiene mimetype inválido", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image", mimetype: "application/pdf" }),
                ...validProductFields()
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Unsupported image type: application/pdf. Please upload Other Type."
        });
    });

    test("responde 400 si title es inválido", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({ title: "" })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Title is required and must be a string with max 42 characters"
        });
    });

    test("responde 400 si category es inválida", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({ category: "invalid" })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Category must be one of: account, service, others"
        });
    });

    test("responde 400 si price es inválido", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({ price: "0" })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Invalid price"
        });
    });

    test("responde 400 si deliveryUnit no es JSON válido", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({ deliveryUnit: "bad-json" })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "deliveryUnit must be valid JSON"
        });
    });

    test("responde 400 si category account recibe accounts inválido", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({
                    category: "account",
                    accounts: "bad-json"
                })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "accounts must be valid JSON"
        });
    });

    test("responde 400 si category service recibe service corto", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({
                    category: "service",
                    service: "short"
                })
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Service must be a text and need have lees of 20 characters"
        });
    });

    test("crea producto account e inserta cuentas", async () => {
        const accounts = [
            { content: "account-content-1" },
            { content: "account-content-2" }
        ];

        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({
                    category: "account",
                    accounts: JSON.stringify(accounts)
                })
            ])
        });

        const db = jest.fn().mockResolvedValue([]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        const insertProductCall = findDbCall(db, "INSERT INTO Products");
        const insertAccountsCalls = db.mock.calls.filter(([query]) =>
            query.includes("INSERT INTO Product_Accounts")
        );

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.message).toBe("Product added successfully");
        expect(reply.payload.product).toEqual(
            expect.objectContaining({
                user_id: 1,
                title: "Valid product",
                price: 100,
                quantity: 2,
                category: "account",
                image: "https://cloudinary.test/image.png"
            })
        );

        expect(insertProductCall).toBeDefined();
        expect(insertProductCall[1]).toEqual([
            expect.any(String),
            1,
            "Valid product",
            100,
            "instant",
            0,
            2,
            "https://cloudinary.test/image.png",
            "account",
            "Valid description"
        ]);

        expect(insertAccountsCalls).toHaveLength(2);
        expect(insertAccountsCalls[0][1]).toEqual([
            expect.any(String),
            expect.any(String),
            1,
            "account-content-1"
        ]);
    });

    test("crea producto service e inserta Product_Service", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields({
                    category: "service",
                    service: "This is a valid service description"
                })
            ])
        });

        const db = jest.fn().mockResolvedValue([]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        const insertServiceCall = findDbCall(db, "INSERT INTO Product_Service");

        expect(reply.statusCode).toBe(200);
        expect(insertServiceCall).toBeDefined();
        expect(insertServiceCall[1]).toEqual([
            expect.any(String),
            expect.any(String),
            1,
            "This is a valid service description"
        ]);
    });

    test("responde 500 si Cloudinary falla", async () => {
        const { reply, request } = await runHelper({
            parts: createParts([
                createFilePart({ fieldname: "image" }),
                ...validProductFields()
            ])
        });

        const db = jest.fn();
        const ci = createCi();

        ci.v2.uploader.upload_stream.mockImplementationOnce((options, callback) => ({
            end: jest.fn(() => {
                callback(new Error("Upload error"));
            })
        }));

        const controller = gestionProduct(db, ci);

        await controller.addProduct(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Cloudinary upload failed",
            details: "Upload error"
        });
    });
});

describe("updateProduct", () => {
    test("responde 400 si falla request.parts", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: () => {
                throw new Error("multipart error");
            }
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Error processing upload: multipart error"
        });
    });

    test("responde 400 si falta imagen nueva o image existente", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: createParts([
                createTextPart("title", "Valid product"),
                createTextPart("category", "account"),
                createTextPart("description", "Valid description"),
                createTextPart("price", "100"),
                createTextPart("deliveryUnit", validDeliveryUnit),
                createTextPart("accounts", JSON.stringify([{ information: "acc" }]))
            ])
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "image is required"
        });
    });

    test("actualiza producto account y reemplaza cuentas", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: createParts([
                ...validProductFields({
                    category: "account",
                    accounts: JSON.stringify([
                        { information: "new-account-1" },
                        { information: "new-account-2" }
                    ])
                })
            ])
        });

        const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        const updateProductCall = findDbCall(db, "UPDATE Products");
        const deleteAccountsCall = findDbCall(db, "DELETE FROM Product_Accounts");
        const insertAccountsCalls = db.mock.calls.filter(([query]) =>
            query.includes("INSERT INTO Product_Accounts")
        );

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.message).toBe("Product updated successfully");

        expect(updateProductCall).toBeDefined();
        expect(updateProductCall[1]).toEqual([
            "Valid product",
            "account",
            "Valid description",
            100,
            "instant",
            0,
            "https://image.test/current.png",
            2,
            "product-1",
            1
        ]);

        expect(deleteAccountsCall).toBeDefined();
        expect(insertAccountsCalls).toHaveLength(2);
    });

    test("actualiza producto service", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: createParts([
                ...validProductFields({
                    category: "service",
                    service: "This is a valid service description"
                })
            ])
        });

        const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        const updateServiceCall = findDbCall(db, "UPDATE Product_Service");

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.message).toBe("Product updated successfully");
        expect(updateServiceCall).toBeDefined();
        expect(updateServiceCall[1]).toEqual([
            "This is a valid service description",
            "product-1",
            1
        ]);
    });

    test("responde 404 si service no actualiza filas", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: createParts([
                ...validProductFields({
                    category: "service",
                    service: "This is a valid service description"
                })
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce({ affectedRows: 1 })
            .mockResolvedValueOnce({ affectedRows: 0 });

        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "No hay filas para actualizar"
        });
    });

    test("actualiza producto others usando asset existente", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" },
            parts: createParts([
                ...validProductFields({
                    category: "others",
                    asset_name: "current-asset.pdf"
                }),
                createFilePart({
                    fieldname: "asset",
                    mimetype: "application/pdf",
                    filename: "asset.pdf"
                })
            ])
        });

        const db = jest.fn().mockResolvedValue({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.updateProduct(request, reply);

        const updateAssetCall = findDbCall(db, "UPDATE Product_Asset");

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.message).toBe("Product updated successfully");
        expect(updateAssetCall).toBeDefined();
        expect(updateAssetCall[1]).toEqual([
            "current-asset.pdf",
            "https://cloudinary.test/asset.pdf",
            "product-1",
            1
        ]);
    });
});

describe("getModifyProduct", () => {
    test("responde 404 si el producto no existe", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" }
        });

        const db = jest.fn().mockResolvedValueOnce([]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getModifyProduct(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "Product not found"
        });
    });

    test("retorna producto account con cuentas", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    title: "Account product",
                    price: 100,
                    deliveryUnit: "instant",
                    delivery_value: 0,
                    image: "image.png",
                    category: "account",
                    quantity: 1,
                    description: "desc"
                }
            ])
            .mockResolvedValueOnce([
                {
                    information: "acc",
                    account_id: "account-1"
                }
            ]);

        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getModifyProduct(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            title: "Account product",
            price: 100,
            image: "image.png",
            deliveryUnit: "instant",
            delivery_value: 0,
            category: "account",
            quantity: 1,
            description: "desc",
            service_msg: "",
            asset_name: "",
            accounts: [
                {
                    information: "acc",
                    account_id: "account-1"
                }
            ]
        });
    });

    test("retorna producto service con service_msg", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    title: "Service product",
                    price: 100,
                    deliveryUnit: "hours",
                    delivery_value: 2,
                    image: "image.png",
                    category: "service",
                    quantity: 1,
                    description: "desc"
                }
            ])
            .mockResolvedValueOnce([
                {
                    information: "service information",
                    service_id: "service-1"
                }
            ]);

        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getModifyProduct(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.service_msg).toBe("service information");
        expect(reply.payload.accounts).toEqual([]);
    });

    test("retorna producto others con asset_name", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    title: "Asset product",
                    price: 100,
                    deliveryUnit: "instant",
                    delivery_value: 0,
                    image: "image.png",
                    category: "others",
                    quantity: 1,
                    description: "desc"
                }
            ])
            .mockResolvedValueOnce([
                {
                    asset_name: "asset.pdf",
                    asset_id: "asset-1"
                }
            ]);

        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getModifyProduct(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.asset_name).toBe("asset.pdf");
        expect(reply.payload.accounts).toEqual([]);
    });

    test("responde 500 si falla la base de datos", async () => {
        const { reply, request } = await runHelper({
            query: { e: "product-1" }
        });

        const db = jest.fn().mockRejectedValueOnce(new Error("DB error"));
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getModifyProduct(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Error getting products"
        });
    });
});

describe("getProduct", () => {
    test("retorna productos filtrados", async () => {
        const products = [
            {
                product_id: "product-1",
                title: "Product"
            }
        ];

        const { reply, request } = await runHelper({
            body: {
                text: "prod",
                category: "account",
                min_price: "1",
                max_price: "100"
            }
        });

        const db = jest.fn().mockResolvedValueOnce(products);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProduct(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(products);
        expect(db.mock.calls[0][1]).toEqual([
            1,
            100,
            "Account",
            "%prod%"
        ]);
    });

    test("retorna productos sin category ni text", async () => {
        const { reply, request } = await runHelper({
            body: {
                text: null,
                category: "any",
                min_price: "1",
                max_price: "100"
            }
        });

        const db = jest.fn().mockResolvedValueOnce([]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProduct(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual([]);
        expect(db.mock.calls[0][1]).toEqual([1, 100]);
    });

    test("responde 500 si falla la base de datos", async () => {
        const { reply, request } = await runHelper({
            body: {
                text: null,
                category: "any",
                min_price: "1",
                max_price: "100"
            }
        });

        const db = jest.fn().mockRejectedValueOnce(new Error("DB error"));
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProduct(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Error getting products"
        });
    });
});

describe("pause", () => {
    test("pausa producto correctamente", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.pause(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("OK");
    });

    test("responde BAD si no actualiza filas", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 0 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.pause(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toBe("BAD");
    });
});

describe("resume", () => {
    test("resume producto correctamente", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.resume(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("OK");
    });

    test("responde BAD si no actualiza filas", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 0 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.resume(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toBe("BAD");
    });
});

describe("remove", () => {
    test("elimina producto lógicamente", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 1 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.remove(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("OK");
    });

    test("responde 404 si no encuentra producto para eliminar", async () => {
        const { reply, request } = await runHelper({
            body: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce({ affectedRows: 0 });
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.remove(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toBe("NOT_FOUND");
    });
});

describe("getNav_Product", () => {
    test("retorna productos del buscador", async () => {
        const results = [
            {
                product_id: "product-1",
                title: "Product",
                price: 100,
                image: "image.png",
                category: "account"
            }
        ];

        const { reply, request } = await runHelper({
            query: {
                product: "pro"
            }
        });

        const db = jest.fn().mockResolvedValueOnce(results);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getNav_Product(request, reply);

        expect(reply.payload).toEqual(results);
        expect(db.mock.calls[0][1]).toEqual(["%pro%", "pro"]);
    });

    test("responde 500 si falla la búsqueda", async () => {
        const { reply, request } = await runHelper({
            query: {
                product: "pro"
            }
        });

        const db = jest.fn().mockRejectedValueOnce(new Error("DB error"));
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getNav_Product(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Error al realizar la búsqueda"
        });
    });
});

describe("getProductById", () => {
    test("responde 400 si falta product_id", async () => {
        const { reply, request } = await runHelper({
            query: {}
        });

        const db = jest.fn();
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProductById(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Missing product_id in query"
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 404 si no encuentra producto", async () => {
        const { reply, request } = await runHelper({
            query: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce([]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProductById(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "Product not found"
        });
    });

    test("retorna producto por id", async () => {
        const product = {
            product_id: "product-1",
            title: "Product"
        };

        const { reply, request } = await runHelper({
            query: {
                product_id: "product-1"
            }
        });

        const db = jest.fn().mockResolvedValueOnce([product]);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProductById(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(product);
    });
});

describe("getProductSelf", () => {
    test("retorna productos del usuario autenticado", async () => {
        const products = [
            {
                product_id: "product-1",
                title: "Product"
            }
        ];

        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce(products);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getProductSelf(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(products);
        expect(db.mock.calls[0][1]).toEqual([1]);
    });
});

describe("getAccounts", () => {
    test("retorna productos account", async () => {
        const products = [{ product_id: "product-1", category: "Account" }];

        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce(products);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getAccounts(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(products);
    });
});

describe("getServices", () => {
    test("retorna productos service", async () => {
        const products = [{ product_id: "product-1", category: "Service" }];

        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce(products);
        const ci = createCi();
        const controller = gestionProduct(db, ci);

        await controller.getServices(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(products);
    });
});