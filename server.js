const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv').config({ path: path.join(__dirname, 'env.env')});
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const headers = require(path.join(__dirname, 'utils', 'httpsHeaders'));
const routers = require(path.join(__dirname, 'routing', 'allRouters'));
const dbsync = require(path.join(__dirname, 'utils', 'dbsync'));
const sequelize = require(path.join(__dirname, 'utils', 'postgresConnection'));
const hbsOptions = require(path.join(__dirname, 'utils', 'handlebarsOptions'));
const { requireUser } = require(path.join(__dirname, 'services', 'authentication'));

if(process.env.DBSYNC === 'true')
    dbsync();

const options = {
    key: fs.readFileSync(process.env.SSLKEY),
    cert: fs.readFileSync(process.env.SSLCRT)
};

const app = express();
const hbs = handlebars.create(hbsOptions);

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(headers({engine: true}));
app.use(cookieParser());

app.use(requireUser);

const port = process.env.PORT || 8000;

const server = https.createServer(options, app).listen(process.env.PORT || port, () => {
    console.log(`>> Server listening at port ${server.address().port}`);
});

routers.forEach(router => app.use(router.basePath, router.router));

process.on('SIGINT', async () => {
    await sequelize.close();
    process.exit(0);
});