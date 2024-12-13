require('dotenv').config();
require('./config/database');
let express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
    
let app = express();
let PORT = process.env.PORT || 9000;

let authentication = require('./modules/v1/Authentications/route_manager');
let services = require('./modules/v1/Authentications/route_manager');

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

var cors = require('cors')
app.use(cors())
app.use("/api/services/", authentication);
app.use("/v1/service", services);

try {
    server = app.listen(process.env.PORT);
    console.log(`Server connected!`, PORT);
} catch (error) {
    console.log(`Failed to Connections!`);
}