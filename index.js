require('dotenv').config();
require('./config/database');
let express = require('express')
const bodyParser = require('body-parser')
    
let app = express();
let PORT = process.env.PORT || 9000;
// Middleware to enable CORS
app.use(cors({
    origin: 'https://hearspeak-frontend.onrender.com', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Allow cookies if needed
}));

let authentication = require('./modules/v1/Authentications/route_manager');
let services = require('./modules/v1/Authentications/route_manager');


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: false }));
// ll
var cors = require('cors')

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/services/", authentication);
app.use("/v1/service", services);

try {
    server = app.listen(process.env.PORT);
    console.log(`Server connected!`, PORT);
} catch (error) {
    console.log(`Failed to Connections!`);
}