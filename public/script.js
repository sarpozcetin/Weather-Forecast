/*get user IP*/
const getIP = `https://api.ipify.org`
            
/**
* Converts UTC time to local time
* @param {number} sunrise - UTC formatted timestamp for sunrise
* @param {number} sunset - UTC formatted timestamp for sunset
* @returns {Date[]} - Array containing local sunrise and sunset time Date objects
*/
function UTC_convert(sunrise, sunset) {
    var localRise = new Date(sunrise *1000);
    var localSet = new Date(sunset * 1000);
    return [localRise, localSet]
}
/**
* Check if time is between sunrise and sunset
* @param {Date} current_tm - Current time
* @param {Date} rise_tm - Local time of sunrise
* @param {Date} set_tm - Local time of sunset
* @returns {boolean} True if current time is between sunrise and sunset, False otherwise
*/
function checkDayTime(current_tm, rise_tm, set_tm) {
    return current_tm > rise_tm && current_tm < set_tm;
}
/**
* Sends data from user to server
* @param {object} data - User data sent to server
* @param {string} data.ip - user IP address
* @param {string} data.timestamp - timestamp in ISO format
* @param {number} data.latitude - user latitude
* @param {number} data.longitude - user longitude
* @param {string} data.city - city name of user location
* @param {string} data.country - country name of user location
*/
function send_to_server(data) {
    fetch('/saveUserData', { //send POST request to server endpoint
        method: 'POST', //specify POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) //Convert data object to JSON string and set it for request body
    })
    .then(response => response.text())
    .then(result => {
        console.log('User data saved:',result);
    })
    .catch(error => {
        console.error('Error saving user data:', error);
    });
}

function retrieve_from_server(data) {
    send_to_server(data);

    fetch('/getweather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            latitude: data.latitude,
            longitude: data.longitude
        })
    })

    .then(response => response.json())
    .then(weatherData => {
        const [rise, set] = UTC_convert(weatherData.sys.sunrise, weatherData.sys.sunset)
        const localSet = set.toLocaleString();
        const localRise = rise.toLocaleString();
        const weatherInfoDiv = document.getElementById('Weather Information');
        const current_tm = new Date();
        const checkTime = checkDayTime(current_tm, rise, set);
        
        //Display information on webpage
        weatherInfoDiv.innerHTML = `
            <p>Sunrise: ${localRise}</p>
            <p>Sunset: ${localSet}</p>
            <p>Temperature (Celsius): ${Math.trunc(weatherData.main.temp - 273.15)}</p>
            <p>Weather Conditions: ${weatherData.weather[0].description}</p>
        `;
        //display sun if day, moon if night
        const timeImage = document.getElementById('timeImage');
        timeImage.innerHTML = `
            <img src="${checkTime ? 'https://github.com/sarpozcetin/LocalView-Application/blob/main/sun.png' : 'https://github.com/sarpozcetin/LocalView-Application/blob/main/moon.png'}" alt="${checkTime ? 'sun' : 'moon'}">
        `;
    })
    .catch (error => {
        console.error('Error with fetching the API', error);
    });
}

//Get user IP address
fetch(getIP)
    .then(response => response.text())
    .then(userIP => fetch(`http://ip-api.com/json/${userIP}`))
    .then(response => response.json())
    //Process user location and send data to server
    .then(location => {
        const userData = {
            ip: location.query,
            timestamp: new Date().toISOString(),
            latitude: location.lat,
            longitude: location.lon,
            city: location.city,
            country: location.country
        };
        retrieve_from_server(userData)
    })       
    .catch(error => {
        console.error('Error with fetching the API', error);
    });
        
    