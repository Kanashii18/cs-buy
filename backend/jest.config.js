// backend/jest.config.js

export default {
     testEnvironment: 'node',

     extensionsToTreatAsEsm: [
          '.ts'
     ],

     transform: {
          '^.+\\.ts$': [
               'babel-jest',
               {
                    presets: [
                         [
                              '@babel/preset-env',
                              {
                                   targets: {
                                        node: 'current'
                                   },
                                   modules: false
                              }
                         ],
                         '@babel/preset-typescript'
                    ]
               }
          ],

          '^.+\\.js$': [
               'babel-jest',
               {
                    presets: [
                         [
                              '@babel/preset-env',
                              {
                                   targets: {
                                        node: 'current'
                                   },
                                   modules: false
                              }
                         ]
                    ]
               }
          ]
     }
};