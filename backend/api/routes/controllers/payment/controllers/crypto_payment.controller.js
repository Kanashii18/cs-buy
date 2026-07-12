import { ECPairFactory, crypto as defaultCrypto, payments, tinysecp } from './_common.js';

export default async function crypto_payment({reply}) {
     const litecoin_network = {
          messagePrefix: '\x19Litecoin Signed Message:\n',
          bech32: 'ltc',
          bip32: {
               public: 0x019da462,
               private: 0x019d9cfe,
          },
          pubKeyHash: 0x30,
          scriptHash: 0x32,
          wif: 0xB0,
     };

     const ECPair = ECPairFactory(tinysecp);

     const keyPair = ECPair.makeRandom({
          rng: defaultCrypto.randomBytes,
          network: litecoin_network,
     });

     const publicKeyCompressed = Buffer.from(keyPair.publicKey);

     const { address: ltcAddress } = payments.p2pkh({
          pubkey: publicKeyCompressed,
          network: litecoin_network,
     });

     console.log('Dirección Litecoin (Mainnet):', ltcAddress);

     return reply.code(200).send('OK');
}
