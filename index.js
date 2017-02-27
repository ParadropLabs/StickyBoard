var express = require('express');
var fileupload = require('express-fileupload');

var app = express();

// Use PARADROP_DATA_DIR when running on Paradrop and /tmp for testing.
var storage_dir = process.env.PARADROP_DATA_DIR || '/tmp';

// Maximum number of notes to display.
var max_visible_notes = process.env.MAX_VISIBLE_NOTES || 16;

app.use(fileupload());
app.use(express.static('static'));
app.use(express.static(storage_dir));
app.set('view engine', 'ejs');

app.locals.notes = [];
for (var i = 0; i < max_visible_notes; i++) {
  if (i % 2 == 0) {
    addNote('paradrop.png');
  } else {
    addNote('paradrop_inverted.png');
  }
}

function addNote(img) {
  app.locals.notes.push({
    img: img,
    order: Math.random(),
  });

  if (app.locals.notes.length > max_visible_notes) {
    app.locals.notes = app.locals.notes.slice(-max_visible_notes);
  }
}

app.post('/create', function(req, res) {
  var img = req.files.img;
  if (img) {
    img.mv(storage_dir + '/' + img.name);
    addNote(img.name);
  }

  res.redirect('/');
});

app.get('/', function(req, res) {
  res.locals.notes = app.locals.notes.slice();
  res.locals.notes.sort(function(a, b) {
    return a.order - b.order;
  });

  res.render('home');
});

app.listen(3000, function() {
  console.log('Listening on port 3000.');
});
