/*
* To-Do
* Learn how to use fetch for specific data fields rather than all fields ***
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
        console.log(weatherData)
        const [rise, set] = UTC_convert(weatherData.sys.sunrise, weatherData.sys.sunset);
        const localSet = set.toLocaleString();
        const localRise = rise.toLocaleString();
        console.log(`Sunrise Time: ${localRise}`); 
        console.log(`Sunset Time: ${localSet}`);
    })

    .catch (error => {
        console.error('Error with fetching the API', error);
    });







