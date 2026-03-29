/**
 * Brevo mail sender – standalone app.
 * POST /api/send with { message } sends that message to TO_EMAIL via Brevo API.
 * Serve the UI at / and API at /api/send.
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
const TO_EMAIL = process.env.TO_EMAIL?.trim();
const SENDER_EMAIL = process.env.SENDER_EMAIL?.trim() || TO_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME?.trim() || 'Brevo Mail Sender';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send', async (req, res) => {
  if (!BREVO_API_KEY || !TO_EMAIL) {
    return res.status(503).json({
      success: false,
      error: 'Server not configured. Set BREVO_API_KEY and TO_EMAIL in .env',
    });
  }

  const message = req.body?.message?.trim();
  const subject = req.body?.subject?.trim() || 'Message from Brevo Mail Sender';

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: TO_EMAIL }],
        subject,
        textContent: message,
        htmlContent: message.replace(/\n/g, '<br>'),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.message || data.code || `Brevo error: ${response.status}`,
      });
    }

    res.json({ success: true, messageId: data.messageId });
  } catch (err) {
    console.error('Send error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send email.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Brevo Mail Sender running at http://localhost:${PORT}`);
  if (!BREVO_API_KEY || !TO_EMAIL) {
    console.warn('Set BREVO_API_KEY and TO_EMAIL in .env to send emails.');
  }
});
