import available_balance from './controllers/available_balance';
import pending_balance from './controllers/pending_balance';
import total_balance from './controllers/total_balance';
import retire_balance from './controllers/retire_balance';
import transitions from './controllers/transitions';
import checkout from './controllers/checkout';
import getWallet from './controllers/get_wallet';

// ================== Wallet Controller ================== //

export default function walletController({ request, reply, db }) {
     return {
          availableBalance: available_balance({ request, reply, db }),
          pendingBalance: pending_balance({ request, reply, db }),
          totalBalance: total_balance({ request, reply, db }),
          retireBalance: retire_balance({ request, reply, db }),
          transitions: transitions({ request, reply, db }),
          checkout: checkout({ request, reply }),
          getWallet: getWallet({ request, reply, db })
     };
}