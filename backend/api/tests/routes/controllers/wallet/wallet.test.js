import {
    describe,
    expect,
    jest,
    test,
    beforeEach,
    afterEach
} from "@jest/globals";

const stripeAccountsCreateMock = jest.fn();
const stripeAccountLinksCreateMock = jest.fn();
const stripeConstructEventMock = jest.fn();

jest.unstable_mockModule("stripe", () => ({
    default: jest.fn(() => ({
        accounts: {
            create: stripeAccountsCreateMock
        },
        accountLinks: {
            create: stripeAccountLinksCreateMock
        },
        webhooks: {
            constructEvent: stripeConstructEventMock
        }
    }))
}));

const WalletController = await import("../../../../routes/controllers/wallet/index");

const createReply = () => ({
    statusCode: null,
    payload: null,

    code: jest.fn(function (status) {
        this.statusCode = status;
        return this;
    }),

    status: jest.fn(function (status) {
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
    headers: {},
    userInfo: {
        id: 1
    },
    ...overrides
});

const runHelper = async (overrides = {}) => {
    const reply = createReply();
    const request = createRequest(overrides);

    return {
        reply,
        request
    };
};

beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    stripeAccountsCreateMock.mockResolvedValue({
        id: "acct_test_123"
    });

    stripeAccountLinksCreateMock.mockResolvedValue({
        url: "https://stripe.test/onboarding"
    });

    stripeConstructEventMock.mockReturnValue({
        type: "payment_intent.succeeded",
        data: {
            object: {
                id: "pi_test_123"
            }
        }
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("available_balance", () => {
    test("responde 404 si no existe wallet", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([]);

        const controller = WalletController(db);

        await controller.available_balance(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "Wallet not found"
        });

        expect(db).toHaveBeenCalledWith(
            "SELECT balance FROM Wallets WHERE user_id = ?",
            [1]
        );
    });

    test("responde 200 con balance disponible", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([
            {
                balance: "100.50",
                pending: "25.25"
            }
        ]);

        const controller = WalletController(db);

        await controller.available_balance(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            available_balance: 75.25
        });
    });

    test("responde 500 si ocurre un error interno", async () => {
        const { reply, request } = await runHelper();

        const db = jest
            .fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = WalletController(db);

        await controller.available_balance(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Internal server error"
        });
    });
});

describe("pending_balance", () => {
    test("responde 404 si no existe wallet", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([]);

        const controller = WalletController(db);

        await controller.pending_balance(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "Wallet not found"
        });

        expect(db).toHaveBeenCalledWith(
            "SELECT pending FROM Wallets WHERE user_id = ?",
            [1]
        );
    });

    test("responde 200 con pending balance", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([
            {
                pending: "30.00"
            }
        ]);

        const controller = WalletController(db);

        await controller.pending_balance(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            pending: "30.00"
        });
    });

    test("responde 500 si ocurre un error interno", async () => {
        const { reply, request } = await runHelper();

        const db = jest
            .fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = WalletController(db);

        await controller.pending_balance(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Internal server error"
        });
    });
});

describe("total_balance", () => {
    test("responde 404 si no existe wallet", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([]);

        const controller = WalletController(db);

        await controller.total_balance(request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "Wallet not found"
        });

        expect(db).toHaveBeenCalledWith(
            "SELECT balance, pending, wallet_id FROM Wallets WHERE user_id = ?",
            [1]
        );
    });

    test("responde 200 con balance total separado en available y pending", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([
            {
                balance: "100.00",
                pending: "20.00",
                wallet_id: "wallet-1"
            }
        ]);

        const controller = WalletController(db);

        await controller.total_balance(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            available: "100.00",
            pending: "20.00"
        });
    });

    test("responde 500 si ocurre un error interno", async () => {
        const { reply, request } = await runHelper();

        const db = jest
            .fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = WalletController(db);

        await controller.total_balance(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Internal server error"
        });
    });
});

describe("retire_balance", () => {
    test("crea cuenta stripe y retorna onboarding url si el usuario tiene role user", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([
            {
                role: "user",
                email: "seller@test.com"
            }
        ]);

        const controller = WalletController(db);

        await controller.retire_balance(request, reply);

        expect(db).toHaveBeenCalledWith(
            expect.stringContaining(
                "SELECT role, email FROM Users WHERE user_id = ?"
            ),
            [1]
        );

        expect(
            stripeAccountsCreateMock
        ).toHaveBeenCalledWith({
            type: "standard",
            email: "seller@test.com",
            country: "US",
            business_type: "individual"
        });

        expect(
            stripeAccountLinksCreateMock
        ).toHaveBeenCalledWith({
            account: "acct_test_123",
            refresh_url: "https://cs-buy.com/reauth",
            return_url: "https://cs-buy.com/success",
            type: "account_onboarding"
        });

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            url: "https://stripe.test/onboarding"
        });
    });

    test("no responde si el usuario no tiene role user", async () => {
        const { reply, request } = await runHelper();

        const db = jest.fn().mockResolvedValueOnce([
            {
                role: "admin",
                email: "admin@test.com"
            }
        ]);

        const controller = WalletController(db);

        await controller.retire_balance(request, reply);

        expect(
            stripeAccountsCreateMock
        ).not.toHaveBeenCalled();

        expect(
            stripeAccountLinksCreateMock
        ).not.toHaveBeenCalled();

        expect(reply.statusCode).toBe(null);
        expect(reply.payload).toBe(null);
    });
});

describe("transitions", () => {
    test("responde 200 con las transacciones del usuario", async () => {
        const transactions = [
            {
                transaction_id: 1,
                user_id: 1,
                amount: 50
            }
        ];

        const { reply, request } = await runHelper();

        const db = jest
            .fn()
            .mockResolvedValueOnce(transactions);

        const controller = WalletController(db);

        await controller.transitions(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toEqual({
            transactions
        });

        expect(db).toHaveBeenCalledWith(
            "SELECT * FROM Transactions WHERE user_id = ? AND wallet_id = (SELECT id FROM Wallets WHERE user_id = ?)",
            [1, 1]
        );
    });

    test("responde 500 si ocurre un error interno", async () => {
        const { reply, request } = await runHelper();

        const db = jest
            .fn()
            .mockRejectedValueOnce(new Error("DB error"));

        const controller = WalletController(db);

        await controller.transitions(request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Internal server error"
        });
    });
});

describe("checkout", () => {
    test("responde 400 si stripe no puede verificar el webhook", async () => {
        stripeConstructEventMock.mockImplementationOnce(() => {
            throw new Error("Invalid signature");
        });

        const { reply, request } = await runHelper({
            body: Buffer.from("{}"),
            headers: {
                "stripe-signature": "bad-signature"
            }
        });

        const db = jest.fn();
        const controller = WalletController(db);

        await controller.checkout(request, reply);

        expect(reply.statusCode).toBe(400);
        expect(reply.payload).toBe(
            "Webhook Error: Invalid signature"
        );
    });

    test("procesa payment_intent.succeeded y responde 200", async () => {
        stripeConstructEventMock.mockReturnValueOnce({
            type: "payment_intent.succeeded",
            data: {
                object: {
                    id: "pi_test_123"
                }
            }
        });

        const { reply, request } = await runHelper({
            body: Buffer.from("{}"),
            headers: {
                "stripe-signature": "valid-signature"
            }
        });

        const db = jest.fn();
        const controller = WalletController(db);

        await controller.checkout(request, reply);

        expect(
            stripeConstructEventMock
        ).toHaveBeenCalledWith(
            request.body,
            "valid-signature",
            process.env.STRIPE_WEBHOOK_SECRET
        );

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("Evento recibido");
    });

    test("procesa transfer.created y responde 200", async () => {
        stripeConstructEventMock.mockReturnValueOnce({
            type: "transfer.created",
            data: {
                object: {
                    id: "tr_test_123",
                    amount: 5000
                }
            }
        });

        const { reply, request } = await runHelper({
            body: Buffer.from("{}"),
            headers: {
                "stripe-signature": "valid-signature"
            }
        });

        const db = jest.fn();
        const controller = WalletController(db);

        await controller.checkout(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("Evento recibido");
    });

    test("procesa transfer.updated succeeded y responde 200", async () => {
        stripeConstructEventMock.mockReturnValueOnce({
            type: "transfer.updated",
            data: {
                object: {
                    id: "tr_test_123",
                    code: "succeeded"
                }
            }
        });

        const { reply, request } = await runHelper({
            body: Buffer.from("{}"),
            headers: {
                "stripe-signature": "valid-signature"
            }
        });

        const db = jest.fn();
        const controller = WalletController(db);

        await controller.checkout(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("Evento recibido");
    });

    test("procesa transfer.updated failed y responde 200", async () => {
        stripeConstructEventMock.mockReturnValueOnce({
            type: "transfer.updated",
            data: {
                object: {
                    id: "tr_test_123",
                    code: "failed"
                }
            }
        });

        const { reply, request } = await runHelper({
            body: Buffer.from("{}"),
            headers: {
                "stripe-signature": "valid-signature"
            }
        });

        const db = jest.fn();
        const controller = WalletController(db);

        await controller.checkout(request, reply);

        expect(reply.statusCode).toBe(200);
        expect(reply.payload).toBe("Evento recibido");
    });
});

describe("getWallet", () => {
    test("responde 401 si no existe session_token", async () => {
        const { reply, request } = await runHelper({
            cookies: {},
            userId: {
                id: 1
            }
        });

        const db = jest.fn();

        await getWallet(db, request, reply);

        expect(reply.statusCode).toBe(401);
        expect(reply.payload).toEqual({
            error: "Unauthenticated"
        });

        expect(db).not.toHaveBeenCalled();
    });

    test("responde 404 si no existe userId en el request", async () => {
        const { reply, request } = await runHelper({
            cookies: {
                session_token: "valid-token"
            },
            userId: null
        });

        const db = jest.fn();

        await getWallet(db, request, reply);

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toBe("Unauthorized");

        expect(db).not.toHaveBeenCalled();
    });

    test("responde 404 si no existe wallet para el usuario", async () => {
        const { reply, request } = await runHelper({
            cookies: {
                session_token: "valid-token"
            },
            userId: {
                id: 1
            }
        });

        const db = jest.fn().mockResolvedValueOnce([]);

        await getWallet(db, request, reply);

        expect(db).toHaveBeenCalledWith(
            "SELECT * FROM Wallets WHERE user_id = ?",
            [1]
        );

        expect(reply.statusCode).toBe(404);
        expect(reply.payload).toEqual({
            error: "wallet not found"
        });
    });

    test("retorna la wallet del usuario", async () => {
        const wallet = {
            id: 10,
            user_id: 1,
            balance: "100.00",
            pending: "20.00"
        };

        const { reply, request } = await runHelper({
            cookies: {
                session_token: "valid-token"
            },
            userId: {
                id: 1
            }
        });

        const db = jest
            .fn()
            .mockResolvedValueOnce([wallet]);

        await getWallet(db, request, reply);

        expect(db).toHaveBeenCalledWith(
            "SELECT * FROM Wallets WHERE user_id = ?",
            [1]
        );

        expect(reply.send).toHaveBeenCalledWith(wallet);
        expect(reply.payload).toEqual(wallet);
    });

    test("responde 500 si ocurre un error inesperado", async () => {
        const { reply, request } = await runHelper({
            cookies: {
                session_token: "valid-token"
            },
            userId: {
                id: 1
            }
        });

        const db = jest
            .fn()
            .mockRejectedValueOnce(new Error("DB error"));

        await getWallet(db, request, reply);

        expect(reply.statusCode).toBe(500);
        expect(reply.payload).toEqual({
            error: "Unknown Error"
        });
    });
});