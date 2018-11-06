var express = require('express');
var router = express.Router();

// create backend
router.get('/', function(req, res, next) {
    const rand = Array.from({length: 20}, () => Math.floor(Math.random() * 9));
    res.send(rand);
});

router.get('/python-test', function (req, res, next) {
    const path = `${__dirname}/../scripts`;
    var PythonShell = require('python-shell');
    console.log("=== path ===", __dirname);
    PythonShell.run('hello_world.py', { scriptPath: path }, function (err, results) {
        if (err) {
            console.log("===err ===", err);
            res.status(500).send(err);
        }
        res.send(results);
    });
});

module.exports = router;
