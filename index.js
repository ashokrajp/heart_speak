require("dotenv").config();
var express = require('express');
var middleware = require('./middleware/headerValidator');
var app = express();




const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: { origin: '*' }
});
// require('./modules/socket/socket')(io);


var user = require('./modules/Auth/route');
var services = require('./modules/Service/route')
const cron = require('./modules/Cron/route');

var bodyParser = require('body-parser')

var cors = require('cors')
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.use(middleware.extractHeaderLanguage);
app.use(middleware.validateHeaderApiKey);
app.use(middleware.validateHeaderToken);

app.use('/api/auth/', user);
app.use('/api/services/', services);
app.use('/api/v1/cron/', cron);





httpServer.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));

