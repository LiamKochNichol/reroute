const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('residents.db');
const PORT = process.env.PORT || 4001;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'Dementia Project')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
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

app.post('/king', (req, res) => {
  console.log(req.body)
  db.run(
    'INSERT INTO residents VALUES ($name, "King", $room, "Hello")',
    {
      $name: req.body.name,
      $room: req.body.room
    },
    (err) => {
      if (err) {
        res.send({message: 'error in app.post(/king)'});
      } else {
        res.send({message: 'successfully run app.post(/king)'});
      }
    }
  )
});

app.post('/king/delete', (req, res) => {
  resName = req.body.name;
  if (resName) {
    db.run(
      'DELETE FROM residents WHERE name = ($name)',
      {
        $name: resName
      });
    res.send('Delete Success');
  } else {
    res.send("Error of request");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
