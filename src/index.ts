import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

const PORT = Number(process.env.PORT) || 3000;
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASS = process.env.EMAIL_PASS!;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// Define a type for tracking data
type TrackingData = {
  email: string;
  opens: number;
  lastOpened: string | null;
};

// Use an index signature to allow dynamic keys
const trackingDB: Record<string, TrackingData> = {};

// 📌 1️⃣ Generate tracking pixel URL and log opens
app.get('/track/:pixel_id', async (c) => {
  const pixelId = c.req.param('pixel_id');

  if (!trackingDB[pixelId]) return c.notFound();

  // Update tracking data
  trackingDB[pixelId].opens += 1;
  trackingDB[pixelId].lastOpened = new Date().toISOString();

  // Return a 1x1 invisible pixel
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/uwFYywAAAAASUVORK5CYII=',
    'base64'
  );
  c.header('Content-Type', 'image/png');
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  return c.body(pixel);
});

// 📌 2️⃣ Send an email with the tracking pixel
app.post('/send-email', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: 'Email is required' }, 400);

  const pixelId = crypto.randomUUID(); // Unique tracking ID
  const trackingUrl = `${SERVER_URL}/track/${pixelId}`;

  // Store tracking info in memory
  trackingDB[pixelId] = { email, opens: 0, lastOpened: null };

  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  try {
    // Send email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Email Tracking Test',
      html: `<p>Hello, this email contains a tracking pixel.</p>
            <img src="${trackingUrl}" width="1" height="1" style="display:none;">`,
    });

    return c.json({ message: 'Email sent!', trackingId: pixelId });
  } catch (error: any) {
    return c.json(
      { error: 'Failed to send email', details: error.message },
      500
    );
  }
});

// 📌 3️⃣ Get tracking report
app.get('/report/:email', async (c) => {
  const email = c.req.param('email');

  // Find tracking data by email
  const record = Object.values(trackingDB).find(
    (entry) => entry.email === email
  );
  if (!record) return c.json({ error: 'No data found' }, 404);

  return c.json({
    email: record.email,
    opens: record.opens,
    lastOpened: record.lastOpened,
  });
});

// 📌 Start Hono Server
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
