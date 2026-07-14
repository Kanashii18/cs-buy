import {
     describe,
     test,
     expect,
     afterAll,
} from '@jest/globals';
// import {
//      bodyLimit,
//      dir,
//      host
// } from "../config/server_config";
// import {
//      Dev
// }from "../config/env";
import fastify from "../api";


describe('api.ts main application', () => {
     // test('configures body limit', () => { 
     //      expect(bodyLimit).toBe(4194304);
     // });
     // test('dir indicate frontend rute', () => { 
     //      expect(dir).toBe("../frontend");
     // });
     // test('host indicate 0.0.0.0', () => { 
     //      expect(host).toBe("0.0.0.0");
     // });

     // test('development mode flag is set', () => {
     //      expect(typeof Dev).toBe('boolean');
     // });
     test("return 404 for an unknown API route", async()=>{
          const response = await fastify.inject({
               method:"GET",
               url:"/url_not_exist"
          });
          expect(response.statusCode).toBe(404);
     })
     afterAll(async()=>{
          await fastify.close();
     })

});

