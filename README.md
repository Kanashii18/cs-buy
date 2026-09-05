# CS-Buy Page

## pagina marketplace en desarrollo, actualmente cerca de termina el prototipo funcional.
<p align="center">
<img src="https://cs-buy-api.onrender.com/assets/icons/logo.svg" alt="Cs-Buy logo" width="150" displey="flex" justify-content="center"  style="vertical-align: middle;">
</p>

<h2 align="center">Technologies</h2>
<p>
  React
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20" alt="React">

  Node.js
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" alt="Node.js">

  Next.js
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="20" alt="Next.js">
</p>

<h2 align="center">Frameworks</h2>
- Tailwind, Fastify, Socket.io, Jwt, Sql12, Crypto, Typescript, Jest

<h2 align="center">Instalation and Execution </h2>
<ul>
  <li><code>npm run install</code></li>
  <li><code>npm run build</code></li>
  <li><code>npm run api</code></li>
  <li>Server will listen on <code>127.0.0.7:4038</code></li>
</ul>

<h1 align="center">Architecture</h1>

```text
Backend
├── api/                         # Root backend directory
│   ├── modules/                 # Tools used by the application
│   │   ├── images.js            # NSFW image filtering using Cloudinary API
│   │   ├── index.js             # Entry point where modules are loaded
│   │   └── logger.js            # Logging with Winston
│   │
│   ├── routes/
│   │   ├── controllers/
│   │   ├── auth.routes.ts       # Authentication, sessions and profile
│   │   ├── chat.routes.ts       # Chat, sessions and notifications
│   │   ├── order.routes.ts      # Orders, cancellations and order history
│   │   ├── purchase.routes.ts   # Checkout and payments
│   │   ├── seller.routes.ts
│   │   ├── user.routes.ts
│   │   └── wallet.routes.ts
│   │
│   ├── scripts/
│   ├── config/
│   ├── middleware/
│   ├── tests/
│   ├── types/
│   ├── api.js
│   └── robots.txt
│
└── metadata/
```  
<h2 align="center">Testing</h2>
- I implemented **Jest** for testing

<h2>Concept about the app</h2>
- Cs-buy marketplace is c2c, i structure the proyect to be used for consumers and by consumers, i implemented chat realtime with socket.io for comunication with seller, when consumer buyer buy something, the seller need to wait for 5 days or wait for confirmation by the buyer, we implement an escrow lite to prevent scam, where money gonna wait in stripe all the time and later gonna be sended to seller wallet, app was create as an fast and optimized page, thats why i implement lazy load with next.js for not reload content when we go to other section, i gonna implement redis later for cache optimization in memory 

##  About me 

- Feel free wht asking me something, i love speak and help ^^.

- [mi telegram](https://t.me/Kanashii188)
- mi discord: [kanashii18](https://www.discord.com/)
