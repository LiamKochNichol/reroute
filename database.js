const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');

db.serialize(() =>{
  //start residents table
  db.run("CREATE TABLE residents (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, floor TEXT, room INTEGER, route TEXT)");
  //create table for floors
  db.run("CREATE TABLE king (id INTEGER, room1 INTEGER, room2 INTEGER, room3 INTEGER, room4 INTEGER, room5 INTEGER, room6 INTEGER, FOREIGN KEY (id) REFERENCES residents(id))");
});

db.close();
