//Import Modules
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path'
import { fileURLToPath} from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express(); //Create express application
const port = 3000; //Define server port number

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const db = new pg.Pool({
    connectionString: process.env.SUPABASE_URL,
    ssl: {rejectUnauthorized: false}
})

db.connect()
    .then(() => console.log('Connection to database successfull'))
    .catch((err) => console.error('Connection to database failed: ', err));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Converts unix timestamp to PostgreSQL format
 * @param {String} timestamp - Unix timestamp
 * @returns {string} - Formatted timestamp 'YYYY-MM-DD HH:MM:SS'
 */
function timestampConvert(timestamp) {
    const dateObj = new Date(timestamp);
    return dateObj.toISOString().replace('T', ' ').split('.')[0]; //Returns timestamp in YYYY-MM-DD HH:MM:SS format
}

/**
 * Handles POST requests to save user data
 * @param {Object} req - The request object containing the user data
 * @param {Object} res - The response object to send back 
 */
app.post('/saveUserData', async (req, res) => {
    const {ip, timestamp, latitude, longitude, city, country} = req.body;
    console.log('Received Data: ', req.body)

    try {
        const formatted_tm = timestampConvert(timestamp);
        const query = `        
            INSERT INTO users (ip_address, timestamp, latitude, longitude, city, country)
            VALUES($1, $2, $3, $4, $5, $6) 
        `;
        await db.query(query, [ip, formatted_tm, latitude, longitude, city, country]);
        console.log('Successfully saved user data');
        res.send('User data was successfully inserted');
        } catch (err) {
            console.error('Failed to insert user data into database: ', err);
            res.status(500).send('Server Error');
        }
});

app.post('/getweather', async (req, res) => {
    const {latitude, longitude} = req.body;

    try {
        const api_call = `https://api.tomorrow.io/v4/weather/forecast?location=${latitude},${longitude}&apikey=${WEATHER_API_KEY}`;
        const response = await fetch(api_call);
        const weatherData = await response.json();
        res.json(weatherData);
    } catch (error) {
        console.error('Failed to fetch weather data: ', error);
        res.status(500).send('Server Error');
    }
});

//Start the server and listen on the port
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`); //Server successfully started
});