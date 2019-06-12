const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');

db.serialize(() =>{
  //start table
  db.run("CREATE TABLE residents (name TEXT, floor TEXT, room INTEGER, route TEXT)");
  //create mock residents
  db.run("INSERT INTO residents VALUES ('John Smith', 'King', 13, 'Hello')");
  db.run("INSERT INTO residents VALUES ('Jane Doe', 'Dundas', 58, 'Hello')");
  db.run("INSERT INTO residents VALUES ('Mary Johnson', 'Queen', 37, 'Hello')");

  db.each("SELECT name, room FROM residents", (err, row) => {
    console.log(row.name + " @ " + row.room);

  });
});

db.close();
