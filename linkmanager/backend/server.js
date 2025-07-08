const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// DB initialisieren
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL
    )
  `);
});

// GET /links → Alle Links abrufen
app.get('/links', (req, res) => {
  db.all('SELECT * FROM links', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /links → Link hinzufügen
app.post('/links', (req, res) => {
  const { url, title } = req.body;
  if (!url || !title) {
    return res.status(400).json({ error: 'URL und Titel sind erforderlich' });
  }
  db.run('INSERT INTO links (url, title) VALUES (?, ?)', [url, title], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, url, title });
  });
});

// Server starten
app.listen(port, () => {
  console.log(`🌐 Server läuft auf http://localhost:${port}`);
});
