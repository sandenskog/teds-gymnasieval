const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure comments file exists
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, '[]');
}

// Email transporter (configured via env vars)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Email-notifieringar aktiverade');
} else {
  console.log('Email-notifieringar ej konfigurerade (ange EMAIL_USER och EMAIL_PASS)');
}

async function sendNotification(name, message) {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'tedsandenskog@gmail.com',
      subject: `Ny lyckönskning från ${name}!`,
      text: `Hej Ted!\n\n${name} har skrivit en lyckönskning till dig:\n\n"${message}"\n\nKolla in sidan för att läsa alla hälsningar!`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e67e22;">Ny lyckönskning!</h2>
          <p><strong>${name}</strong> har skrivit:</p>
          <blockquote style="border-left: 4px solid #e67e22; padding: 12px 16px; background: #fef9f3; margin: 16px 0; border-radius: 4px;">
            ${message}
          </blockquote>
          <p style="color: #888; font-size: 14px;">Kolla in sidan för att läsa alla hälsningar!</p>
        </div>
      `,
    });
    console.log(`Email-notis skickad (ny kommentar från ${name})`);
  } catch (err) {
    console.error('Kunde inte skicka email:', err.message);
  }
}

// GET all comments
app.get('/api/comments', (req, res) => {
  const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
  res.json(JSON.parse(data));
});

// POST new comment
app.post('/api/comments', async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Namn och meddelande krävs' });
  }

  if (name.length > 100 || message.length > 1000) {
    return res.status(400).json({ error: 'Namn eller meddelande är för långt' });
  }

  const comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  const comment = {
    id: Date.now(),
    name: name.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
  };
  comments.push(comment);
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));

  // Send email notification (don't block the response)
  sendNotification(comment.name, comment.message);

  res.status(201).json(comment);
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
