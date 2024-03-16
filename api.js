/*
* To-Do
* Convert sunrise and sunset unix utc to local time javascript
*/

const getIP = `https://api.ipify.org`

/*Converts UTC time to local time*/
function UTC_convert(sunrise, sunset) {
    var localRise = new Date(sunrise *1000);
    var localSet = new Date(sunset * 1000);
    return [localRise, localSet]
}

fetch(getIP)
    .then (response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error("API network response failed");
        }
    })

    .then (userIP => {
        return fetch(`http://ip-api.com/json/${userIP}`);
    })

    .then (response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("API network response failed")
        }
    })

    .then(location => {
        return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=1ae6d582e5f832e5ef80c26237b32034`);
    })

    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("API network response failed")
        }
    })

    .then(weatherData => {
        const [rise, set] = UTC_convert(weatherData.sys.sunrise, weatherData.sys.sunset)
        console.log(rise)
        console.log(set)
    })

    .catch (error => {
        console.error('Error with fetching the API', error);
    });







