const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('C:\\Users\\Zhang\\.workbuddy\\workbuddy.db');
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
  if (err) return console.error(err);
  console.log('tables:', rows.map(r => r.name));
  db.close();
});
