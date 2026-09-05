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
Backend ->
[ 
  api "root backend archive"->
    modules "tools that we use in the app" ->
      images.js "module to filter nsfw images using cloudinary api"
      index.js "barriel where modules are called"
      logger.js "module to make logs using winston"
    routes ->
      controllers ->
      auth.routes.ts "route where user can log out, log in, verify session, validate images, modify profile and get profile information"
      chat.routes.ts "route to control chat, session chat and notifications"
      order.routes.ts "route to verify order buyed, get a cancelation for some reason and get buyed orders list" 
      purchase.routes.ts "route to manage checkout buy section, complete order or cancel session, we use Stripe, Paypal and Bitcoin as payment method
      seller.routes.ts ""
      user.routes.ts
      wallet.routes.ts
    scripts ->
    config ->
    middleware ->
    tests ->
    types ->
    api.js ""
    robots.txt ""
  metadata ->
]
  
<h2 align="center">Testing</h2>
- I implemented **Jest** for testing

## Sobre mi
aunque me gusta mucho mas el desarrollo Backend actualmente estoy trabajando de forma autodidacta en el desarrollo de una pagina marketplace,
utilizo React, Vite, frameworks como framer-motion en la infraestructura del proyecto...

- Siente libre de querer hablar si asi lo deseas, me gusta tanto ayudar como ser ayudado ^^.

- [mi telegram](https://t.me/Kanashii188)
- mi discord: [kanashii18](https://www.discord.com/)
