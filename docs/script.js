/* Get user IP */
const getIP = `https://api.ipify.org`;

/**
 * Converts UTC time to local time
 * @param {number} timestamp - UTC formatted timestamp
 * @returns {Date} - Local time Date object
 */
function UTC_convert(timestamp) {
    return new Date(timestamp * 1000);
}

/**
 * Sends user data to the server
 * @param {object} data - User data to be sent
 */
function send_to_server(data) {
    fetch('/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        console.log('User data saved:', result);
    })
    .catch(error => {
        console.error('Error saving user data:', error);
    });
}

/**
 * Retrieves weather data from the server and updates the webpage
 * @param {object} data - User location data
 */
function retrieve_from_server(data) {
    send_to_server(data);

    fetch('/getweather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            latitude: data.latitude,
            longitude: data.longitude
        })
    })
    .then(response => response.json())
    .then(weatherData => {
        if (!weatherData || !weatherData.timelines || !weatherData.timelines.daily) {
            throw new Error('Invalid weather data received');
        }

        const dailyForecasts = weatherData.timelines.daily;
        
        dailyForecasts.forEach((day, index) => {
            if (index < 5) { // We only want 5 day forecasts
                const date = new Date(day.time).toLocaleDateString();
                const tempMin = Math.trunc(day.values.temperatureMin);
                const tempMax = Math.trunc(day.values.temperatureMax);
                const sunrise = UTC_convert(day.values.sunriseTime).toLocaleTimeString();
                const sunset = UTC_convert(day.values.sunsetTime).toLocaleTimeString();
                const windSpeedMin = Math.trunc(day.values.windSpeedMin);
                const windSpeedMax = Math.trunc(day.values.windSpeedMax);
                const conditions = day.values.weatherCodeMax;
                
                const box = document.getElementById(`day${index}`);
                if (box) {
                    box.innerHTML = `
                        <p><strong>${date}</strong></p>
                        <p>Temp Min: ${tempMin}°C</p>
                        <p>Temp Max: ${tempMax}°C</p>
                        <p>Sunrise: ${sunrise}</p>
                        <p>Sunset: ${sunset}</p>
                        <p>Wind Speed Min: ${windSpeedMin} km/h</p>
                        <p>Wind Speed Max: ${windSpeedMax} km/h</p>
                        <p>Conditions: ${conditions}</p>
                    `;
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching the weather API:', error);
    });
}

/**
 * Fetches user IP and location, then retrieves weather data
 */
function getUserLocationAndWeather() {
    fetch(getIP)
        .then(response => response.text())
        .then(userIP => fetch(`http://ip-api.com/json/${userIP}`))
        .then(response => response.json())
        .then(location => {
            const userData = {
                ip: location.query,
                timestamp: new Date().toISOString(),
                latitude: location.lat,
                longitude: location.lon,
                city: location.city,
                country: location.country
            };
            retrieve_from_server(userData);
        })
        .catch(error => {
            console.error('Error fetching user location:', error);
        });
}

// Start the process
getUserLocationAndWeather();
