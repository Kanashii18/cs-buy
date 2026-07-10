import jwt from 'jsonwebtoken';
/**
 * @returns code and msg to reply, EJ: code:200, msg:"OK" or code:401, msg:"Unauthorized"
 */
export default function(request,reply) {
     // verify token validation from user...
     const token = request.cookies.session_token;
     if(!token || typeof(token) !== "string" ) return {code:401, msg:"Unauthorized"};

     // create userinfo with { id, img, username }
     let userInfo;
     try {
          userInfo = jwt.verify(token, process.env.SECRET_KEY);
     }
     catch{ return {code:401, msg: "Invalid Token"}};

     // return object { id, img, username } with user info
     request.userInfo = userInfo;
     return {code:200,msg:"OK"};
}