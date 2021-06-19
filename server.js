const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv').config({ path: path.join(__dirname, 'env.env')});
const bodyParser = require('body-parser');
const { auth  } = require('express-openid-connect');
const handlebars = require('express-handlebars');
const headers = require(path.join(__dirname, 'utils', 'httpsHeaders'));
const routers = require(path.join(__dirname, 'routing', 'allRouters'));
const dbsync = require(path.join(__dirname, 'utils', 'dbsync'));
const sequelize = require(path.join(__dirname, 'utils', 'postgresConnection'));
const config = require(path.join(__dirname, 'utils', 'oidcConfig'));
const hbsOptions = require(path.join(__dirname, 'utils', 'handlebarsOptions'));


if(process.env.DBSYNC === 'true')
    dbsync();

const options = {
    key: fs.readFileSync(process.env.SSLKEY),
    cert: fs.readFileSync(process.env.SSLCRT)
};

const app = express();

app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    genid: () => crypto.randomBytes(64).toString('hex')
}));



const hbs = handlebars.create(hbsOptions);
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(headers({engine: true}));

const port = process.env.PORT || 8000;

const server = https.createServer(options, app).listen(process.env.PORT || port, () => {
    console.log(`>> Server listening at port ${server.address().port}`);
});

//TODO: Delete files from uploads/jamtrack/pending older than some value in intervals and shit

app.use(auth(config));

routers.forEach(router => app.use(router.basePath, router.router));

process.on('SIGINT', async () => {
    await sequelize.close();
    process.exit(0);
});