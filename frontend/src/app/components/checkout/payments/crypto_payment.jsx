import { Client, resources } from 'coinbase-commerce-node';

const API_KEY = 'your-coinbase-commerce-api-key';
Client.init(API_KEY); // Inicializa el cliente con tu API Key

const { Charge } = resources;

const createCryptoPayment = async (amount) => {
    try {
        const chargeData = {
            name: "Test Product",
            description: "Description of the product",
            local_price: {
                amount: amount,   // Monto a pagar (USD o la moneda que elijas)
                currency: "USD"
            },
            pricing_type: "fixed_price",
            metadata: {
                customer_name: "Customer Name"
            }
        };

        const charge = await Charge.create(chargeData); // Crear el pago
        return charge.hosted_url;  // URL de pago para el cliente
    } catch (error) {
        console.error("Error creating crypto payment:", error);
        throw new Error("Error creating crypto payment");
    }
};

// Llama a esta función cuando el cliente seleccione el pago en criptomonedas
createCryptoPayment(10.00)
    .then(paymentUrl => {
        console.log("Redirect user to:", paymentUrl);
    })
    .catch(error => {
        console.error(error);
    });
