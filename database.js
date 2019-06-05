const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');

db.serialize(() =>{
  //start table
  db.run("CREATE TABLE residents (name TEXT, room INTEGER)");
  //create mock residents
  db.run("INSERT INTO residents VALUES ('John Smith', 13)");
  db.run("INSERT INTO residents VALUES ('Jane Doe', 58)");
  db.run("INSERT INTO residents VALUES ('Mary Johnson', 37)");

  db.each("SELECT name, room FROM residents", (err, row) => {
    console.log(row.name + " @ " + row.room);
  });
});

db.close();
