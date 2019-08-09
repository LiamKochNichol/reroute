const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');

app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'Dementia Project')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/static', express.static('public'));

// *This code contains routers to all needed pages*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/floors', (req, res) => {
  res.sendFile(path.join(__dirname, '/floorDirect.html'));
});

app.get('/thisFloor', (req, res) => {
  res.sendFile(path.join(__dirname, '/thisFloor.html'));
});

app.get('/setup', (req, res) => {
  res.sendFile(path.join(__dirname, '/setup.html'));
});

// *This code serves images*
//front logo
app.get('/images/frontlogo.png', (req, res) => {
  res.sendFile(path.join(__dirname, '/images/frontlogo.png'));
});

// *This code serves css*
app.get('/stylesheet.css', (req, res) => {
  res.sendFile(path.join(__dirname, '/stylesheet.css'));
});

//routers to files needed for Mapael Functionality
app.get('/node_modules/jquery-mapael/js/jquery.mapael.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/jquery-mapael/js/jquery.mapael.js'));
});

app.get('/node_modules/raphael/raphael.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/raphael/raphael.js'));
});

app.get('/node_modules/jquery-mapael/js/maps/newtestfloorplan.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/jquery-mapael/js/maps/newtestfloorplan.js'));
});

//*This code contains all editing functions for nursing homes and rooms*

//this inserts a new home into "home" table with the given name and password
app.post('/submitHome', (req, res) => {
  let name = req.body.name;
  let password = req.body.password;
  db.run(
    'INSERT INTO home (name, password) VALUES ($name, $password)',
    {
      $name: name,
      $password: password,
    },
    (err) => {
      if (err) {
        console.log(err);
        res.status(400).send({});
      } else {
        res.status(200).send({});
      }
    }
  )
});

//for creating a new floor
app.post('/submitFloor', (req, res) => {
  //sort required information and increase readability
  let home = req.body.homeName;
  let password = req.body.homePass;
  let name = req.body.floorName;
  let start = req.body.start;
  let stop = req.body.stop;
  let mapfile = req.body.mapfile;
  //first get the id of the nursing home
  db.get('SELECT id FROM home WHERE name = ($home) AND password = ($password)',
    {
      $home: home,
      $password: password,
    },
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(400).send({})
      } else if (row) {
        //then create a row of info in the floor table
        db.run('INSERT INTO floors (homeId, floorName, mapfile) VALUES ($id, $name, $mapfile)',
          {
            $id: row.id,
            $name: name,
            $mapfile: mapfile,
          },
          (err) => {
            if (err) {
              console.log(err);
              res.status(400).send({})
            } else {
              let accum = 'id INTEGER, ';
              for (i = start; i <= stop; i++) {
                if (i === start) {
                  accum += "room" + i + " INTEGER DEFAULT 0";
                } else {
                  accum += ", room" + i + " INTEGER DEFAULT 0";
                }
              }
              let create = "CREATE TABLE " +  home + name + " (" + accum + ")";
              //then create the floor table which is separate
              db.run(create,
                (err) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send({})
                  } else {
                    res.status(200).send({})
                  }
                }
              )
            }
          }
        )
      } else {
        console.log("ID is not found");
      }
    }
  )
});

// *This code contains all functions managing floor information*

//used for logging in
app.get('/login', (req, res) => {
  //input of home and password
  //if they match in databse, send through
  let homeName = req.query.home;
  let homePass = req.query.pass;
  db.get('SELECT id FROM home WHERE name = ($name) AND password = ($password)',
    {
      $name: homeName,
      $password: homePass,
    },
    (err, id) => {
      if (err) {
        console.log(err);
        res.status(400).send({pass: "no"});
      } else {
        if (id) {
          res.status(200).send({
            pass: "yes",
            id: id
          });
        } else {
          res.status(400).send({});
        }
      }
    }
  )
});

//used to get the floors for a specific nursing home after login
app.get('/getFloors', (req, res) => {
  //input is homeId, return all floors of that home
  let id = req.query.id;
  db.all("SELECT * FROM floors WHERE homeId = ($id)",
    {
      $id: id,
    },
    (err, rows) => {
      if (err) {
        console.log(err);
        res.status(400).send("Failed Query");
      } else {
        console.log(rows);
        res.status(200).send(rows);
      }
    }
  )
});

// *This code manages all resident functions*

//this returns all the alert states of each room of the resident's floor
app.get('/mapIt/:id/:floor', (req, res) => {
  //input is resident id and the floor they are on
  //output is the rooms and the alert state they have (alert on or off)
  let query = 'SELECT * FROM ' + req.params.floor + ' WHERE id = ' + req.params.id;
  db.all(query,
    (err, rows) => {
      if (err) {
        console.log(err);
        res.status(400);
      } else {
       res.status(200).send(rows[0]);
      }
    }
  )
});

//this updates the alert states of each room for a specific resident on a specific floor
app.post('/updateRoom/:floor', (req, res) => {
  //input resident id, room to change state of, what state room will be in and what floor the room is on
  if (req.body.resId && req.body.room && req.body.routeSetting){
    let query = 'UPDATE ' + req.params.floor + ' SET ' + req.body.room + '= ($routeSetting) WHERE id = ($id)';
    db.run(query,
      {
        $routeSetting: req.body.routeSetting,
        $id: req.body.resId,
      },
      (err) => {
        if (err) {
          console.log(err);
          res.send(400).send({});
        } else {
          res.status(200).send({});
        }
      }
    )
  }
});

//finds all residents on a particular floor
app.get('/getFloorResidents/:tableName', (req, res) => {
  //input floor name and return all residents on floor
  db.all('SELECT * FROM residents WHERE floor = ($tableName)',
  {
    $tableName: req.params.tableName,
  },
  (err, rows) => {
    res.json(rows);
  });
});

//find all informatino on one resident
app.get('/requestResidentInfo/:resId', (req, res) => {
  //input resident id and return all information
  const resId = req.params.resId;
  db.all(
  'SELECT * FROM residents WHERE id = $id',
    {
      $id: resId,
    },
    (err, rows) => {
      if (rows.length > 0) {
        res.send(rows[0]);
      } else {
        res.send({});
      }
    }
  );
});

//creates a resident on a floor
app.post('/inputResident/:tableName', (req, res) => {
    //input is resident name, room number, home id and floor (toblename)
    if (req.body.name && req.body.room) {
      //first insert data into the residents table
      db.run(
        'INSERT INTO residents (name, floor, room, homeId) VALUES ($name, $tableName, $room, $homeId)',
        {
          $name: req.body.name,
          $tableName: req.params.tableName,
          $room: req.body.room,
          $homeId: req.body.homeId,
        },
        (err) => {
          if (err) {
            console.log(err);
            res.status(400);
          } else {
            //then insert a row into the resident's floor
            let query = 'INSERT INTO ' + req.params.tableName + ' (id) VALUES ( LAST_INSERT_ROWID() )'
            db.run(
              query,
              (err) => {
                if (err) {
                  console.log(err);
                  res.status(400);
                } else {
                  //then select the resient id and return it
                  db.get('SELECT id FROM residents WHERE name = $name AND room = $room',
                    {
                      $name: req.body.name,
                      $room: req.body.room,
                    },
                    (err, row) => {
                      if (err) {
                        console.log(err);
                        res.status(400);
                      } else {
                        console.log(row.id.toString());
                        res.status(200).send((row.id).toString());
                      }
                    }
                  )
                }
              }
            )
          }
        }
      )
    } else {
      console.log('Empty post');
    }
});

//delete a resident from database
app.post('/deleteResident', (req, res) => {
  //input resident id and floor (tableName) and delete from database
  let resId = req.body.id;
  let tableName = req.body.tableName;
  if (resId) {
    //first delete from residents table
    db.run(
      'DELETE FROM residents WHERE id = ($id)',
      {
        $id: resId,
      },
      (err, rows) => {
        if (err) {
          console.log(err);
          res.status(400);
        } else {
          //then delete from their respective floor table
          let query = 'DELETE FROM ' + tableName + ' WHERE id = ' + resId;
          db.run(query,
            (err) => {
              if (err) {
                console.log(err);
                res.status(400);
              } else {
                res.status(200).send('Delete Success');
              }
            }
          )
        }
      }
    );
  } else {
    res.send({});
  }
});

//to edit the data of a resident
app.post('/editResident', (req, res) => {
  //input new and old - name and room to update database
  oldName = req.body.oldName;
  oldRoom = req.body.oldRoom;
  newName = req.body.newName;
  newRoom = req.body.newRoom;
  if (oldName && oldRoom && newName && newRoom) {
    db.run(
      'UPDATE residents SET name = ($newName), room = ($newRoom) WHERE name = ($oldName) AND room = ($oldRoom)',
      {
        $newName: newName,
        $newRoom: newRoom,
        $oldName: oldName,
        $oldRoom: oldRoom,
      },
      (err) => {
        if (err) {
          console.log('Editing error');
          res.status(400).send({});
        } else {
          console.log('Editing success');
          res.status(200).send({});
        }
      }
    );
  } else {
    console.log("Editing error: Parameters are not properly set");
  }
});

//to start server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
