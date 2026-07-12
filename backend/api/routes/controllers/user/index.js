import loginUserController from './controllers/login_user.controller';
import createUserController from './controllers/create_user.controller';
import deleteUserController from './controllers/delete_user.controller';
import modifyUserController from './controllers/modify_user.controller';
import getUnreadController from './controllers/get_unread.controller';
import getNotifyController from './controllers/get_notify.controller';

// ================== User Controller ================== //

export function userController(db, ci, request, reply) {
     return {
          loginUser: loginUserController({ db, request, reply }),
          createUser: createUserController({ db, request, reply }),       
          deleteUser: deleteUserController({ db, request, reply }),
          modifyUser: modifyUserController({ db, request, reply, ci }),
          getUnread: getUnreadController({ db, request, reply }),
          getNotify: getNotifyController({ db, request, reply })
     };
}