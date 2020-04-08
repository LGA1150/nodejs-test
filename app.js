const  pug = require('pug'), // Formerly Jade
    express = require('express'),
    bodyParser=require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    app = express();

const port = 8000;

mongoose.connect('mongodb://localhost:27017/signin', function (err, db) {
    if (err) throw err;
    console.log('Connected to MongoDB Server');
})

var route = require('./controllers/route.js');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

route.controller(app);