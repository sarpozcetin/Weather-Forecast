/*
* To-Do
* fix invalid API key
* fix requestParam
# Find a way to find users latitude and longitude dynamically
*/

/*fixed lat and long for sidney BC*/
const url = 'https://api.openweathermap.org/data/2.5/weather?lat=48.65&lon=123.39&appid=983279cc1932b902a3ee3449104d0d3f'
const key = '1ae6d582e5f832e5ef80c26237b32034'

const requestParam = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer $key',
    },
};

fetch(url, requestParam)
    .then (response => {
        if (!response.ok) {
            throw new error('Network Response was unsuccessful');
        }
        return response.json();
    })

    .then (data => {
        outputElement.textContent = JSON.stringify(data, NULL, 2);
    })

    .catch (error => {
        console.error('Error:',error);
    });






