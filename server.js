var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');

var config = {
    user: 'pmj642',
    database: 'pmj642',
    host: 'db.imad.hasura-app.io',
    port: 5432,
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

function hash(input,salt)
{
    var hash = crypto.pbkdf2Sync(input,salt, 10000, 512, 'sha512');
    return ["pbkdf2",salt,10000,hash.toString('hex')].join('$');
}

app.get('/hash/:input', function (req,res) {
    var hashedString = hash(req.params.input,'a-random-string');
    res.send(hashedString);
});

app.post('/create-user', function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    
    pool.query('insert into "user" (username,password) values ($1,$2)', [username,dbString], (err,result) => {
        if(err) {
            res.status(500).send(err.toString());
        }
        else {
            res.send('Successfully created user: ' + username + "<br>");
        }
    });
});


app.post('/login', function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('select * from "user" where username = $1', username, (err,result) => {
        if(err) {
            res.status(500).send(err.toString());
        }
        else {
            
            if(result.rows.length === 0)
                res.status(403).send('username/password invalid!'); 
            else
            {
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[1];
                var hashedPass = hash(password,salt);
                
                if(hashedPass === dbString)
                    res.send('Credentials valid!');
                else
                    res.status(403).send('username/password invalid!');                                         
                
            }
        }
    });
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var pool = new Pool(config);
app.get('/test-db',function (req,res) {
    
    pool.query('select * from article', (err,result) => {
        if(err) {
            res.status(500).send(err.toString());
        }
        else {
            res.send(JSON.stringify(result.rows));
        }
    });
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
