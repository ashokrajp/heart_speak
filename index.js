require('dotenv').config();
require('./config/database');
let express = require('express')
const bodyParser = require('body-parser')
let app = express();
let PORT = process.env.PORT || 9000;
// Middleware to enable CORS
const httpServer = require('http').createServer(app);

var cors = require('cors')
app.use(cors({ origin: '*' })); // Allow all origins

// app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


let authentication = require('./modules/v1/Authentications/route_manager');
let services = require('./modules/v1/Authentications/route_manager');


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: false }));
// ll
app.use('/', require('./middleware/headerValidators').validateHeaderApiKey)
app.use('/', require('./middleware/headerValidators').validateHeaderToken)
    
// var bodyParser = require('body-parser')

app.use("/api/services/", authentication);
app.use("/v1/auth", services);

var cors = require('cors')
app.use(cors({ origin: '*' })); // Allow all origins

httpServer.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
