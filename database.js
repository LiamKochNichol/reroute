const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');

db.serialize(() =>{
  //create nursing home table
  db.run("CREATE TABLE home (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)");
  //create floor tracker table
  db.run("CREATE TABLE floors (homeId INTEGER, floorName TEXT, mapfile TEXT)");
  //start residents table
  db.run("CREATE TABLE residents (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, floor TEXT, room INTEGER, homeId INTEGER)");
});

db.close();
