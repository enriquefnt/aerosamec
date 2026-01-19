const sqlite3 = require('sqlite3').verbose();

// Abre la BD (se crea si no existe)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error al abrir BD:', err.message);
  } else {
    console.log('Conectado a la BD SQLite.');
  }
});

// Inicializa tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;