import { describe, expect, jest, test } from "@jest/globals";

const compareMock = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: compareMock,
  },
}));

const { default: bcrypt } = await import("bcrypt");
const { userController } = await import("../user.controller.js");

const ci = {};

const success_login = [
    {
        user_id: 1,
        email: "myusername@hotmail.com",
        username: "myusername",
        password: "12345678",
        role: "user",
        img: null
    }
];

const createReply = () => {
    return {
      statusCode: null,
        payload: null,
        code(status) {
            this.statusCode = status;
            return this;
        },
        send(data) {
            this.payload = data;
            return this;
        },
        cookie() {
            return this;
        }
    }
}

// ================================ //  Login Testing // ================================  // 

const loginCredential = (body = {}) => {
    return {
        body: body,
        headers: {
            "x-forwarded-for": "123.45.67.890"
        },
        socket: {
          remoteAddress: "127.0.0.1:4038"
        },
        deviceId: "test-device"
    };
}
const runLogin = async(body) => {
    const reply = createReply(); 
    const request = loginCredential(body);
    
    
    return { reply, request};
}

describe("login",()=>{

    test("loginUser responde 400 si la password es incorrecta", async () => {
        bcrypt.compare.mockResolvedValueOnce(false);

        const { reply, request } = await runLogin({
            username: "myusername",
            password: "12345678"
        });

        const db = jest.fn()
            .mockResolvedValueOnce([]) // isBanned
            .mockResolvedValueOnce(success_login); // SELECT Users

        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload.message).toBe("Incorrect Password.");
        expect(reply.payload.error).toBe("Invalid credentials");
    });

    test("loginUser responde 400 si falta username o password", async () => {
        const {reply, request} = await runLogin();
        const db = jest.fn().mockResolvedValueOnce(success_login);
        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload.message).toBe("Please provide both username and password.");
        expect(reply.payload.error).toBe("Missing username or password fields.");
    });

    test("loginUser responde 400 con password muy corta", async() => {
        const {reply, request} = await runLogin({ username:"myusername", password:"1234" });    
        const db = jest.fn().mockResolvedValueOnce(success_login);
        const controller = userController(db, ci);
        await controller.loginUser(request, reply);
        
        expect(reply.statusCode).toBe(400);
        expect(reply.payload.message).toBe("Your password must be between 6 and 30 characters.");
        expect(reply.payload.error).toBe("Password too short or long");
    });

    test("loginUser responde 403 al estar baneado", async()=>{
        const {reply, request} = await runLogin({ username:"myusername", password:"12345678"});    
        const db = jest.fn().mockResolvedValueOnce([{ user_id: 1, id:"123.45.67.890", device:"test-device" }]);
        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(403);
        expect(reply.payload.error).toBe("Access denied.");
    });

    test("loginUser response 400 al ingresar incorrectamente username/email", async()=>{
        const {reply, request} = await runLogin({ username:"myusername", password:"12345678"});    
        const db = jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]);
        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload.message).toBe("Incorrect username/email.");
        expect(reply.payload.error).toBe("Invalid credentials");
    }); 

    test("login compara password con pepper", async () => {
        const {reply, request} = await runLogin({ username:"myusername", password:"12345678"});    
        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(success_login)
            .mockResolvedValueOnce(success_login);

        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(bcrypt.compare).toHaveBeenCalled();
    });

    test("loginUser response 200 al loggear correctamente", async()=>{
        const {reply, request} = await runLogin({ username:"myusername", password:"12345678"});    
        const db = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(success_login)
            .mockResolvedValueOnce(success_login);

        const controller = userController(db, ci);
        await controller.loginUser(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload.message).toBe("successful");
    });
})



// ======================================================================================  // 

