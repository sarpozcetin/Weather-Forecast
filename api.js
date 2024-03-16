/*
* To-Do
* Find a way to find users latitude and longitude dynamically
* Convert sunrise and sunset unix utc to local time javascript
* http://www.geoplugin.net/json.gp?ip=24.68.121.168
*/

/*fixed lat and long for sidney BC*/
const getIP = `https://api.ipify.org`
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
        return response.json();
    })

    .then(location => {
        return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=1ae6d582e5f832e5ef80c26237b32034`);
    })

    .then(response => {
        return response.json();

    })

    .then(weatherData => {
        //console.log(weatherData.sys.sunrise)
        //console.log(weatherData.sys.sunset)
        const [rise, set] = UTC_convert(weatherData.sys.sunrise, weatherData.sys.sunset)
        console.log(rise)
        console.log(set)


    })

    .catch (error => {
        console.error('Error with fetching the API', error);
    });

//const b = 'http://www.geoplugin.net/json.gp?ip=${a}'
//console.log(b)
/*fetch(weatherAPI)
    .then (response => {
        if (!response.ok) {
            throw new error('Network Response was unsuccessful');
        }
        return response.json();
    })

    .then (data => {
        console.log(data)
    })

    .catch (error => {
        console.error(error);
    });*/






