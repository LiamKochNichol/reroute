const express = require('express');
const app = express();
const path = require('path');

module.exports = app;

const PORT = process.env.PORT || 4001;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

class Resident {
  constructor(name,roomNumber) {
    this.name = name;
    this.roomNumber = roomNumber;
  }
}

app.use(express.static('Dementia Project'));

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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
