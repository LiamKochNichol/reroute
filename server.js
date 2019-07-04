const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'Dementia Project')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.get('/lastid', (req, res) => {
  db.run('SELECT LAST_INSERT_ROWID()',
    (err, id) => {
      if (err) {
        console.log(err);
      } else {
        console.log(id);
        res.send(id);
      }
    }
  )
});

app.post('/updateRoom', (req, res) => {
  console.log(req.body.resId + " : " + req.body.room + " : " + req.body.routeSetting);
  if (req.body.resId && req.body.room && req.body.routeSetting){
    let query = 'UPDATE king SET ' + req.body.room + '= ($routeSetting) WHERE id = ($id)';
    db.run(query,
      {
        $routeSetting: req.body.routeSetting,
        $id: req.body.resId,
      },
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    )
  }
});

app.post('/king/inputResident', (req, res) => {
    console.log("POST1");
    console.log(req.body.name + req.body.room);
    if (req.body.name && req.body.room) {
      db.run(
        'INSERT INTO residents (name, floor, room, route) VALUES ($name, "King", $room, "Hello")',
        {
          $name: req.body.name,
          $room: req.body.room,
        },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            db.run(
              'INSERT INTO king (id, room1, room2, room3, room4, room5, room6) VALUES (LAST_INSERT_ROWID(), 0, 0, 0, 0, 0, 0)',
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                  db.get('SELECT id FROM residents WHERE name = $name AND room = $room',
                    {
                      $name: req.body.name,
                      $room: req.body.room,
                    },
                    (err, row) => {
                      if (err) {
                        console.log(err);
                        res.send("Error from insert");
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
    console.log("GET 1");
});

app.get('/king/getit/:id', (req, res) => {
  //find the id for the new resident
  let resId = req.params.id;
  db.all('SELECT * FROM king WHERE id = $id',
    {
      $id: resId,
    },
    (err, rows) => {
      if (err) {
        console.log("Route Error");
      } else {
       console.log(rows);
       res.send(rows[0]);
      }
    }
  )
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/node_modules/jquery-mapael/js/jquery.mapael.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/jquery-mapael/js/jquery.mapael.js'));
});

app.get('/node_modules/raphael/raphael.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/raphael/raphael.js'));
});

app.get('/node_modules/jquery-mapael/js/maps/newtestfloorplan.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/jquery-mapael/js/maps/newtestfloorplan.js'));
});

app.get('/king', (req, res) => {
  res.sendFile(path.join(__dirname, '/king.html'));
});

app.get('/queen', (req, res) => {
  res.sendFile(path.join(__dirname, '/queen.html'));
});

app.get('/dundas', (req, res) => {
  res.sendFile(path.join(__dirname, '/dundas.html'));
});

app.get('/king/residents', (req, res) => {
  db.all('SELECT * FROM residents WHERE floor = "King"', (err, rows) => {
    res.json(rows);
  });
});

app.get('/king/:name', (req, res) => {
  const lookupName = req.params.name;
  db.all(
  'SELECT * FROM residents WHERE name = $name AND floor = "King"',
    {
    $name: lookupName,
    },
    (err, rows) => {
      if (rows.length > 0) {
        console.log(rows);
        res.send(rows[0]);
      } else {
        res.send({});
      }
    }
  );
});

app.post('/king/delete', (req, res) => {
  resId = req.body.id;
  if (resId) {
    db.run(
      'DELETE FROM residents WHERE id = ($id)',
      {
        $id: resId,
      },
      (err, rows) => {
        if (err) {
          console.log(err);
          res.send(500);
        } else {
          db.run(
            'DELETE FROM king where id = ($id)',
            {
              $id: resId,
            },
            (err) => {
              if (err) {
                console.log(err);
                res.status(500);
              } else {
                res.status(200);
              }
            }
          )
        }
      }
    );
    res.send('Delete Success');
  } else {
    res.send("Error of request");
  }
});

app.post('/king/edit/:name', (req, res) => {
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
        $oldRoom: oldRoom
      });
    res.send('Edit Success')
  } else {
    console.log("Edit error hit");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
