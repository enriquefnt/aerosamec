const db = require('./db.js');

// Create: Añade un nuevo item
async function createItem(data) {
  return new Promise((resolve, reject) => {
    const { name, description } = data;
    db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, name, description });
    });
  });
}

// Read: Obtiene todos los items
async function readItems() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Update: Edita un item por ID
async function updateItem(id, data) {
  return new Promise((resolve, reject) => {
    const { name, description } = data;
    db.run('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id], function(err) {
      if (err) reject(err);
      else resolve({ id, name, description });
    });
  });
}

// Delete: Elimina un item por ID
async function deleteItem(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { createItem, readItems, updateItem, deleteItem };