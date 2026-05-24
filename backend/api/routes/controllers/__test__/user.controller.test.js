import { describe, expect, jest, test, beforeEach } from "@jest/globals";

process.env.SECRET_KEY = "test-secret-key";
process.env.SECRET_PEPPER = "test-pepper";
process.env.DEVICE_SECRET = "test-device-secret";
process.env.NODE_ENV = "test";

const compareMock = jest.fn().mockResolvedValue(true);
const hashMock = jest.fn().mockResolvedValue("hashed-password");
const hashSyncMock = jest.fn().mockReturnValue("hashed-password-sync");
const jwtSignMock = jest.fn().mockReturnValue("jwt-token");

jest.unstable_mockModule("bcrypt", () => ({
    default: {
        compare: compareMock,
        hash: hashMock,
        hashSync: hashSyncMock
    }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
        sign: jwtSignMock
    }
}));

jest.unstable_mockModule("@google-cloud/vision", () => ({
    default: {}
}));

jest.unstable_mockModule("multer", () => ({
    default: jest.fn(() => ({
        single: jest.fn()
    }))
}));

const { default: bcrypt } = await import("bcrypt");
const jwt = (await import("jsonwebtoken")).default;
const { userController, ensureDevice } = await import("../user.controller.js");

const ci = {
    v2: {
        uploader: {
            upload_stream: jest.fn((options, callback) => ({
                end: jest.fn(() => {
                    callback(null, {
                        secure_url: "https://cloudinary.test/profile.png"
                    });
                })
            }))
        }
    }
};

const userRow = {
    user_id: 1,
    email: "myusername@hotmail.com",
    username: "myusername",
    password: "stored-hash",
    role: "user",
    img: null
};

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
    }),

    cookie: jest.fn(function () {
        return this;
    })
});

const createRequest = (body = {}, overrides = {}) => ({
    body,
    headers: {
        "x-forwarded-for": "123.45.67.890"
    },
    socket: {
        remoteAddress: "127.0.0.1:4038"
    },
    deviceId: "test-device",
    cookies: {},
    query: {},
    userInfo: {
        id: 1
    },
    ...overrides
});

const runHelper = async (body = {}, overrides = {}) => {
    const reply = createReply();
    const request = createRequest(body, overrides);

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
    filename = "profile.png",
    buffer = Buffer.from("fake-image")
} = {}) => ({
    type: "file",
    fieldname,
    mimetype,
    filename,
    toBuffer: jest.fn().mockResolvedValue(buffer)
});

const createParts = (parts = []) => {
    return async function* partsGenerator() {
        for (const part of parts) {
            yield part;
        }
    };
};

const findDbCall = (db, text) => {
    return db.mock.calls.find(([query]) => query.includes(text));
};

// ============================================================================== //

let consoleLogSpy;
let consoleErrorSpy;
beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashed-password");
    bcrypt.hashSync.mockReturnValue("hashed-password-sync");
    jwt.sign.mockReturnValue("jwt-token");
});
afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
});

// ============================================================================== //

describe("ensureDevice", () => {
    test("crea deviceId y cookie si no existe cookie válida", () => {
        const request = createRequest();
        const reply = createReply();
        const next = jest.fn();

        ensureDevice(request, reply, next);

        expect(request.deviceId).toEqual(expect.any(String));
        expect(reply.cookie).toHaveBeenCalledWith(
            "__did",
            expect.stringMatching(/^[^.]+\.[^.]+$/),
            expect.objectContaining({
                httpOnly: false,
                sameSite: "lax",
                secure: false,
                maxAge: 31536000000,
                path: "/"
            })
        );
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("usa la cookie válida existente sin crear otra cookie", () => {
        const requestA = createRequest();
        const replyA = createReply();

        ensureDevice(requestA, replyA, jest.fn());

        const cookieValue = replyA.cookie.mock.calls[0][1];

        const requestB = createRequest({}, {
            cookies: {
                __did: cookieValue
            }
        });
        const replyB = createReply();
        const next = jest.fn();

        ensureDevice(requestB, replyB, next);

        expect(requestB.deviceId).toBe(requestA.deviceId);
        expect(replyB.cookie).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });
});

describe("loginUser", () => {
    test("responde 400 si falta username o password", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "Please provide both username and password.",
            error: "Missing username or password fields."
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 400 si la password tiene longitud inválida", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "1234"
        });

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "Your password must be between 6 and 30 characters.",
            error: "Password too short or long"
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 403 si el dispositivo o ip está baneado", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([{ banned: 1 }]);

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(403);
        expect(reply.payload).toEqual({
            error: "Access denied."
        });
    });

    test("responde 400 si username o email no existe", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "Incorrect username/email.",
            error: "Invalid credentials"
        });
    });

    test("responde 400 si la password es incorrecta", async () => {
        bcrypt.compare.mockResolvedValueOnce(false);

        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([userRow]);

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "Incorrect Password.",
            error: "Invalid credentials"
        });
    });

    test("compara password usando pepper", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([userRow])
            .mockResolvedValue([]);

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(bcrypt.compare).toHaveBeenCalledWith(
            "12345678test-pepper",
            "stored-hash"
        );
    });

    test("responde 200, crea cookie y retorna usuario público si login es correcto", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([userRow])
            .mockResolvedValue([]);

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            user: {
                id: userRow.user_id,
                username: userRow.username,
                img: userRow.img,
                role: userRow.role
            },
            message: "successful",
            loggedIn: true
        });

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: userRow.user_id,
                email: userRow.email,
                username: userRow.username,
                role: userRow.role
            },
            "test-secret-key",
            { expiresIn: "7d" }
        );

        expect(reply.cookie).toHaveBeenCalledWith(
            "session_token",
            "jwt-token",
            expect.objectContaining({
                httpOnly: false,
                secure: false,
                path: "/",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
        );
    });

    test("responde 500 si ocurre un error interno después del ban check", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = userController(db, ci);

        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Internal server error"
        });
    });
});

describe("createUser", () => {
    test("responde 400 si falta email o password", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Missing required fields."
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 400 si la password tiene longitud inválida", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "1234"
        });

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Your password must be between 6 and 30 characters."
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 409 si el usuario ya existe", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    user_id: "user-1",
                    email: "test@email.com"
                }
            ]);

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(409);
        expect(reply.payload).toEqual({
            error: "User already exists"
        });

        expect(db).toHaveBeenCalledTimes(1);
        expect(db.mock.calls[0][1]).toEqual(["test@email.com"]);
    });

    test("responde 403 si el dispositivo o ip está baneado", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ banned: 1 }]);

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(403);
        expect(reply.payload).toEqual({
            error: "Access denied."
        });
    });

    test("hashea la password usando pepper", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn().mockResolvedValue([]);

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(bcrypt.hash).toHaveBeenCalledWith(
            "12345678test-pepper",
            12
        );
    });

    test("inserta usuario y wallet correctamente", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn().mockResolvedValue([]);

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        const insertUserCall = findDbCall(db, "INSERT INTO Users");
        const insertWalletCall = findDbCall(db, "INSERT INTO Wallets");

        expect(reply.statusCode).toBe(200);
        expect(insertUserCall).toBeDefined();
        expect(insertWalletCall).toBeDefined();

        expect(insertUserCall[1]).toEqual([
            expect.any(String),
            expect.any(String),
            "test@email.com",
            "hashed-password",
            expect.stringContaining("../data/images/profiles-images/"),
            expect.any(String),
            "There's nothing here yet... or maybe you're just not seeing it right.",
            "user",
            0
        ]);

        expect(insertWalletCall[1]).toEqual([
            expect.any(String),
            expect.any(String),
            0,
            expect.any(String)
        ]);
    });

    test("responde 200, crea cookie y retorna datos públicos al crear usuario", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn().mockResolvedValue([]);

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            username: expect.any(String),
            loggedIn: true,
            img: expect.stringContaining("../data/images/profiles-images/"),
            message: "OK",
            role: "client",
            user_id: expect.any(String)
        });

        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({
                id: expect.any(String),
                email: "test@email.com",
                username: expect.any(String),
                role: "user"
            }),
            "test-secret-key",
            { expiresIn: "7d" }
        );

        expect(reply.cookie).toHaveBeenCalledWith(
            "session_token",
            "jwt-token",
            expect.objectContaining({
                httpOnly: false,
                secure: false,
                path: "/",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
        );
    });

    test("responde 500 si falla la base de datos", async () => {
        const { reply, request } = await runHelper({
            email: "test@email.com",
            password: "12345678"
        });

        const db = jest.fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = userController(db, ci);

        await controller.createUser(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Database error"
        });
    });
});

describe("deleteUser", () => {
    test("deleteUser responde 400 si falta username o password", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.deleteUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Missing required fields."
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("deleteUser responde 400 si username o password son incorrectos", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.deleteUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            message: "Incorrect username or password",
            error: "Invalid credentials"
        });

        expect(db).toHaveBeenCalledTimes(1);
        expect(db.mock.calls[0][0]).toContain("SELECT * FROM Users");
        expect(db.mock.calls[0][1]).toEqual(["myusername", "12345678"]);
    });

    test("deleteUser elimina usuario y wallet correctamente", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([{ user_id: 1 }]) // SELECT Users
            .mockResolvedValueOnce({ affectedRows: 1 }) // DELETE Users
            .mockResolvedValueOnce({ affectedRows: 1 }); // DELETE Wallets

        const controller = userController(db, ci);

        await controller.deleteUser(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            message: "User successfully deleted"
        });

        expect(db).toHaveBeenCalledTimes(3);

        expect(db.mock.calls[0][0]).toContain("SELECT * FROM Users");
        expect(db.mock.calls[0][1]).toEqual(["myusername", "12345678"]);

        expect(db.mock.calls[1][0]).toContain("DELETE FROM Users");
        expect(db.mock.calls[1][1]).toEqual([1]);

        expect(db.mock.calls[2][0]).toContain("DELETE FROM Wallets");
        expect(db.mock.calls[2][1]).toEqual([1]);
    });

    test("deleteUser responde 500 si ocurre un error en base de datos", async () => {
        const { reply, request } = await runHelper({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = userController(db, ci);

        await controller.deleteUser(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Server error while deleting user"
        });
    });
});

describe("modifyUser", () => {
    test("responde 401 si la contraseña de seguridad es incorrecta", async () => {
        bcrypt.compare.mockResolvedValueOnce(false);

        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "wrong-password"),
                createTextPart("username", "newUsername")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(401);
        expect(reply.payload).toEqual({
            message: "Incorrect password"
        });
    });

    test("responde 400 si la imagen está vacía", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createFilePart({
                    buffer: Buffer.from("")
                })
            ])
        });

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "image is empty (0 bytes)"
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 400 si el tipo de imagen no está permitido", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createFilePart({
                    mimetype: "application/pdf"
                }),
                createTextPart("security", "12345678")
            ])
        });

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Unsupported image type: application/pdf. Please upload Other Type."
        });
        expect(db).not.toHaveBeenCalled();
    });

    test("responde 400 si description es inválida", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("description", "x".repeat(130))
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Your description cannot have more than y characters."
        });
    });

    test("responde 400 si email es inválido", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("email", "bad-email")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload.error).toBe("Your email have a invalid structure. example@gmail.com");
    });

    test("responde 400 si password nueva es inválida", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("password", "1234")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Your password must be between 6 and 30 characters."
        });
    });

    test("responde 400 si username es inválido", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("username", "a".repeat(16))
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toEqual({
            error: "Your username cannot have more than 16 characters."
        });
    });

    test("actualiza username, email y description correctamente", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("username", "newUsername"),
                createTextPart("email", "newemail@gmail.com"),
                createTextPart("description", "Nueva descripción")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ])
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        const updateCall = findDbCall(db, "UPDATE Users SET");

        expect(updateCall).toBeDefined();
        expect(updateCall[0]).toContain("username = ?");
        expect(updateCall[0]).toContain("email = ?");
        expect(updateCall[0]).toContain("description = ?");
        expect(updateCall[1]).toEqual([
            "newUsername",
            "newemail@gmail.com",
            "Nueva descripción",
            1
        ]);

        expect(reply.payload).toEqual({
            message: "Datos actualizados correctamente"
        });
    });

    test("hashea password nueva antes de actualizar", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("password", "newPassword")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ])
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        const updateCall = findDbCall(db, "UPDATE Users SET");

        expect(bcrypt.hashSync).toHaveBeenCalledWith(
            "newPasswordtest-pepper",
            12
        );

        expect(updateCall).toBeDefined();
        expect(updateCall[0]).toContain("password = ?");
        expect(updateCall[1]).toEqual([
            "hashed-password-sync",
            1
        ]);

        expect(reply.payload).toEqual({
            message: "Datos actualizados correctamente"
        });
    });

    test("sube imagen a cloudinary y actualiza img", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createFilePart()
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ])
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        const updateCall = findDbCall(db, "UPDATE Users SET");

        expect(ci.v2.uploader.upload_stream).toHaveBeenCalledWith(
            {
                folder: "images",
                resource_type: "image"
            },
            expect.any(Function)
        );

        expect(updateCall).toBeDefined();
        expect(updateCall[0]).toContain("img = ?");
        expect(updateCall[1]).toEqual([
            "https://cloudinary.test/profile.png",
            1
        ]);

        expect(reply.payload).toEqual({
            message: "Datos actualizados correctamente"
        });
    });

    test("responde 500 si falla la actualización después de validar seguridad", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: createParts([
                createTextPart("security", "12345678"),
                createTextPart("username", "newUsername")
            ])
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    password: "stored-hash"
                }
            ])
            .mockRejectedValueOnce(new Error("Update error"));

        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            message: "Error al procesar la solicitud"
        });
    });

    test("responde 401 si ocurre un error general en el token o request", async () => {
        const { reply, request } = await runHelper({}, {
            userInfo: { id: 1 },
            parts: undefined
        });

        const db = jest.fn();
        const controller = userController(db, ci);

        await controller.modifyUser(request, reply);

        expect(reply.statusCode).toBe(401);
        expect(reply.payload).toEqual({
            error: "Invalid token"
        });
    });
});

describe("get_unread", () => {
    test("responde unread 0 si no hay registros", async () => {
        const { reply, request } = await runHelper({}, {
            query: {
                id: 1
            }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.get_unread(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            unread: 0
        });

        expect(db).toHaveBeenCalledWith(
            expect.stringContaining("FROM chat_user_room_status"),
            [1, 1]
        );
    });

    test("suma unread_count_user_1 cuando id es user_id", async () => {
        const { reply, request } = await runHelper({}, {
            query: {
                id: 1
            }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    user_id: 1,
                    other_id: 2,
                    unread_count_user_1: 3,
                    unread_count_user_2: 10
                },
                {
                    user_id: 1,
                    other_id: 3,
                    unread_count_user_1: 4,
                    unread_count_user_2: 20
                }
            ]);

        const controller = userController(db, ci);

        await controller.get_unread(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            unread: 7
        });
    });

    test("suma unread_count_user_2 cuando id es other_id", async () => {
        const { reply, request } = await runHelper({}, {
            query: {
                id: 1
            }
        });

        const db = jest.fn()
            .mockResolvedValueOnce([
                {
                    user_id: 2,
                    other_id: 1,
                    unread_count_user_1: 30,
                    unread_count_user_2: 5
                },
                {
                    user_id: 3,
                    other_id: 1,
                    unread_count_user_1: 40,
                    unread_count_user_2: 6
                }
            ]);

        const controller = userController(db, ci);

        await controller.get_unread(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            unread: 11
        });
    });
});

describe("getNotify", () => {
    test("retorna notificaciones y las marca como leídas", async () => {
        const notifications = [
            {
                image: "image.png",
                price: 100,
                buyer: 2,
                title: "Producto vendido",
                timestamp: "2026-01-01 10:00:00"
            }
        ];

        const { reply, request } = await runHelper({}, {
            userInfo: {
                id: 1
            }
        });

        const db = jest.fn()
            .mockResolvedValueOnce(notifications)
            .mockResolvedValueOnce([]);

        const controller = userController(db, ci);

        await controller.getNotify(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual(notifications);

        expect(db.mock.calls[0][0]).toContain("FROM Notifications");
        expect(db.mock.calls[0][1]).toEqual([1]);

        expect(db.mock.calls[1][0]).toContain("UPDATE Notifications");
        expect(db.mock.calls[1][1]).toEqual([1]);
    });
});