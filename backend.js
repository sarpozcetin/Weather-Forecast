//Import Modules
import express from 'express';
import bodyParser from 'body-parser';
import pg, { Pool } from 'pg';
import readline from 'readline';
import { fileURLToPath} from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express(); //Create express application
const port = 3000; //Define server port number

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const db = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRESS_PW,
    port: process.env.POSTGRES_PORT,
});

db.connect()
    .then(() => {
        console.log('PostgreSQL database conected...');
        startServer(db)
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database:', err.message);
        process.exit(1); //If connection to database fails exit
    });
/**
 * Starts the express server and sets up routes
 * @param {object} db - PostgreSQL database connection
 */
function startServer(db) {
    //Use body parser middleware to parse JSON request
    app.use(bodyParser.json());
    //Serve static files from the public folder
    app.use(express.static(path.join(__dirname, 'public')));

    /**
     * Converts unix timestamp to PostgreSQL format
     * @param {String} timestamp - Unix timestamp
     * @returns {string} - Formatted timestamp 'YYYY-MM-DD HH:MM:SS'
     */
    function timestampConvert(timestamp) {
        const dateObj = new Date(timestamp);
        const year = dateObj.getFullYear();
        const month = (`0${dateObj.getMonth() + 1}`).slice(-2);
        const day = (`0${dateObj.getDate()}`).slice(-2);
        const hours = (`0${dateObj.getHours()}`).slice(-2);
        const minutes = (`0${dateObj.getMinutes()}`).slice(-2);
        const seconds = (`0${dateObj.getSeconds()}`).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Handles POST requests to save user data
     * @param {Object} req - The request object containing the user data
     * @param {Object} res - The response object to send back 
     */
    app.post('/saveUserData', (req, res) => {
        const {ip, timestamp, latitude, longitude, city, country } = req.body; //Destructure request
        console.log('Recieved Data:', req.body); //Recieved data
        const formatted_tm = timestampConvert(timestamp); //Convert timestamp to MySQL format
        const query = 'INSERT INTO userInfo (ip_address, timestamp, latitude, longitude, city, country) VALUES (?, ?, ?, ?, ?, ?)';

        //Execute SQL query to insert user data
        db.query(query, [ip, formatted_tm, latitude, longitude, city, country], (err, result) => {
            if (err) {
                console.error('Error inserting following data:', err); //Log errors
                res.status(500).send('Server Error');
            } else {
                console.log('User Data Saved.........'); //Success
                res.send('User Data successfully inserted');
            }
        });
    });
    app.post('/getweather', (req, res) => {
        const {latitude, longitude} = req.body;
        const api_url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=${7}&appid=${WEATHER_API_KEY}`;
        fetch(api_url)
            .then(response => response.json())
            .then(weatherData => {
                res.json(weatherData);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                res.status(500).send('Server Error');
            });
    });

    //Start the server and listen on the port
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`); //Server successfully started
    });
}

//Start the initial prompt for user password
passwordPrompt(databaseConnection);