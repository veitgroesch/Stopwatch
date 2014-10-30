var routes = require('./routers/routes.js');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var httpStatus = require('http-status-codes');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('a user disconnected');
    });
    //socket.emit('newUser', {hello: 'world'});
});

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'classicmotordays'
});


//selbstgeschriebene logging middleware
app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
})


// register middleware
app.use('/', express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, 'bower_components')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/api/laps', function (req, res) {
    var data = req.body;
    var setzrunde = data.lap.setzrunde ? 1 : 0;
    var meanDelta = data.lap.meanDelta ? 1 : 0;
    var sumDelta = data.lap.sumDelta;

    var sql = "INSERT INTO laps (startnummer, runde, laptime, setzrunde, meanDelta, delta, sumDelta, date) VALUES ('" +
        data.lap.startnummer +
        "', '" + data.lap.runde +
        "', '" + data.lap.laptime +
        "', '" + setzrunde +
        "', '" + meanDelta +
        "', '" + data.lap.delta +
        "', '" + data.lap.sumDelta +
        "', '" + data.lap.date + "')";
    connection.query(sql,
        function (err, rows, fields) {
            if (err) {
                console.log('error: Database INSERT');
                throw err;
            } else {
                var id = rows.insertId;
                data.lap.id = id;
                io.emit('newdata', {});
                res.status(httpStatus.CREATED).json(data);
            }
        });
    // deltas berechnen
    if (data.lap.runde === 4) {
        var deltaM = Math.round(sumDelta / 4 * 100) / 100;
        var sql = "INSERT INTO laps (startnummer, runde, laptime, setzrunde, meanDelta, delta, sumDelta, date) VALUES ('" +
            data.lap.startnummer +
            "', '" + 5 +
            "', '" + 0 +
            "', '" + 0 +
            "', '" + 1 +
            "', '" + deltaM +
            "', '" + 0 +
            "', '" + data.lap.date + "')";
        connection.query(sql,
            function (err, rows, fields) {
                if (err) {
                    console.log('error: Database INSERT');
                    throw err;
                } else {
                    var id = rows.insertId;
                    data.lap.id = id;
                    io.emit('newdata', {});
                    //res.status(httpStatus.CREATED).json(data);
                }
            });
    }
});

app.delete('/api/laps/:id', function (req, res) {
    var sql = "DELETE FROM `laps` WHERE `id`=" + req.params.id;
    connection.query(sql,
        function (err, rows, fields) {
            if (err) {
                console.log('error: Database INSERT');
                throw err;
            } else {
                io.emit('deldata', req.params.id);
                res.status(httpStatus.OK).end();
            }
        });
});

app.get('/api/laps', function (req, res) {
    var sql = "SELECT * FROM laps";
    connection.query(sql,
        function (err, rows, fields) {
            if (err) {
                console.log('error: Database INSERT');
                throw err;
            } else {
                var laps = {'laps': rows};
                res.status(httpStatus.OK).json(laps);
            }
        });
});

app.use(routes);

http.listen(1337, function () {
    console.log('ready on port 1337');
});
