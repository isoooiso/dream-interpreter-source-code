# Dream Interpreter (GenLayer)

Describe your dream, get an AI interpretation, and save the most interesting dreams on-chain.

## Setup
```bash
npm install
cp .env.example .env
```

Edit `.env`:
```bash
VITE_GENLAYER_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```

Run:
```bash
npm run dev
```

## Contract
Deploy `contracts/contract.py` in GenLayer Studio, then copy the deployed contract address into `.env` / `.env.production`.

## GitHub Pages
1. Ensure `vite.config.js` has `base: '/<repo-name>/'`
2. Create `.env.production` with your contract address and RPC
3. Build:
```bash
npm run build
```
4. Upload the **contents** of `dist/` into the GitHub repo root (so `index.html` is in the root).
