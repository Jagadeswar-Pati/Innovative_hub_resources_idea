# Brevo Mail Sender

Standalone app: paste a message, click **Send**, and it sends that email to your configured address via Brevo.

## Setup

1. **Copy env file and add your keys**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `BREVO_API_KEY` – Your Brevo API key (Brevo dashboard → SMTP & API → API Keys).
   - `TO_EMAIL` – The email that receives the message (e.g. `inovativehubofficial@gmail.com`).

2. **Install and run**
   ```bash
   npm install
   npm start
   ```
   Open http://localhost:3000 (or the port you set in `PORT`).

3. **Use the UI**  
   Enter an optional subject, paste your message, click **Send**. The email is sent to `TO_EMAIL` via Brevo.

## Deploy (e.g. Render)

- Set environment variables in the dashboard: `BREVO_API_KEY`, `TO_EMAIL`. Optionally `SENDER_EMAIL`, `SENDER_NAME`, `PORT`.
- Build command: leave empty or `npm install`.
- Start command: `npm start`.

No database or other services required.
