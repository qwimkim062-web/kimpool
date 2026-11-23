# KIM POOL

## Local development

Install dependencies, then start the frontend and game server together:

```sh
npm install
npm run dev
```

Open the Vite URL shown in the terminal. `npm run dev` starts the game server on port 3001 and the Vite frontend, which proxies `/ws` to that same server. Both players must use the same running game server; on a local network they can open the host computer's LAN address. This local setup does not make the game server reachable over the public internet.

## Production

Build and run the combined HTTP and WebSocket server:

```sh
npm run build
npm start
```

The server uses the hosting provider's `PORT` value and serves the built app, `/api/health`, and `/ws`. ## Vercel deployment

`vercel.json` configures the Vite build and the `/api/ws` WebSocket Function. After installing the Vercel CLI and signing in:

```sh
npm install -g vercel
vercel
```

The WebSocket route uses Vercel Functions' beta WebSocket support and has a 300-second maximum duration. Connections eventually close and need reconnect handling. Room state is in memory, so players routed to different function instances may not see the same room. The local development server does not change this Vercel limitation.

## Prototype limitations

Live two-player rooms and server-simulated shots are implemented, but room state is held in memory and is lost when a function instance restarts. Cue-ball scratches are called as fouls; the cue ball is returned to the table and the online turn passes. Production use still needs account authentication, durable cross-instance storage, reconnection/abandonment handling, rate limits, and a complete tournament/rules service. Demo credits have no cash value.
