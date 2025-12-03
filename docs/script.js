// script.js
// Features a 5 day forecast provided by Tomorrow.io

let WEATHER_API_KEY = window.ENV?.WEATHER_API_KEY;
const API_BASE = "https://api.tomorrow.io/v4/weather/forecast";

// When the page loads and API key is available, start
document.addEventListener('DOMContentLoaded', () => {
    if (WEATHER_API_KEY) { 
        reallyStartWeather();
    }
});

function reallyStartWeather() {
    WEATHER_API_KEY = window.ENV?.WEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
        return;
    }
    getWeather();
}

// Fetches the user location and the 5 day weather forecast
async function getWeather() {
    document.querySelectorAll('.box').forEach(b => b.innerHTML = '<p style="font-size:1.2rem">Loading...</p>'); 
    try {
        // Get the location provided from the user IP address
        const locRes = await fetch("https://ipapi.co/json/");
        const loc = await locRes.json();  
        // Request only the needed weather fields from Tomorrow.io
        const fields = 'temperatureMin,temperatureMax,temperatureApparentAvg,weatherCodeMax,sunriseTime,sunsetTime,windSpeedAvg,windDirectionAvg,humidityAvg,visibilityAvg,precipitationProbabilityAvg,uvIndexAvg';
        const url = `${API_BASE}?location=${loc.latitude},${loc.longitude}&timesteps=1d&units=metric&timezone=auto&fields=${fields}&apikey=${WEATHER_API_KEY}`;   
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("API error");
        }
        const data = await res.json();
        if (!data.timelines?.daily?.length) {
            throw new Error("No data"); 
        }

        // Fill each forecast box with obtained information
        data.timelines.daily.slice(0, 5).forEach((day, i) => {
            const box = document.getElementById(`day${i}`);
            if (!box) { 
                return;
            }   
            const date = new Date(day.time).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
            const tempMin = Math.round(day.values.temperatureMin);
            const tempMax = Math.round(day.values.temperatureMax);
            const feels   = Math.round(day.values.temperatureApparentAvg || tempMax);
            const sunrise = new Date(day.values.sunriseTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const sunset  = new Date(day.values.sunsetTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const wind    = Math.round(day.values.windSpeedAvg || 0);
            const dir     = windDirection(day.values.windDirectionAvg);
            const code    = day.values.weatherCodeMax;  
            const conditions = {
            1000: "Clear", 1001: "Cloudy", 1100: "Mostly Clear", 1101: "Partly Cloudy",
            4000: "Drizzle", 4001: "Rain", 4200: "Light Rain", 4201: "Heavy Rain",
            6000: "Snow", 6200: "Light Snow", 6201: "Heavy Snow", 8000: "Thunderstorm"
            }[code] || "Weather";   
            // Ensure that the only animated background is the one corresponding to the current days condition
            if (i === 0) {
                const now = new Date();
                const isNight = now < new Date(day.values.sunriseTime) || now > new Date(day.values.sunsetTime);
                setDynamicBackground(code, isNight);
            }

            // Insert the data into the boxes
            box.innerHTML = `
                <div class="location">${loc.city}, ${loc.country}</div>
                <div class="date">${i === 0 ? "Today" : date}</div>
                <div class="temps"><span class="high">H: ${tempMax}°</span><span class="low">L: ${tempMin}°</span></div>
                <div class="condition">${conditions}</div>
                <div class="info-grid">
                    <div class="info-item"><span>Feels like</span>      <strong>${feels}°</strong></div>
                    <div class="info-item"><span>Wind</span>           <strong>${dir} ${wind} km/h</strong></div>
                    <div class="info-item"><span>Humidity</span>       <strong>${Math.round(day.values.humidityAvg)}%</strong></div>
                    <div class="info-item"><span>Visibility</span>     <strong>${(day.values.visibilityAvg||0).toFixed(0)} km</strong></div>
                    <div class="info-item"><span>Precipitation</span>  <strong>${Math.round(day.values.precipitationProbabilityAvg||0)}%</strong></div>
                    <div class="info-item"><span>UV Index</span>       <strong>${day.values.uvIndexAvg||0}</strong></div>
                </div>
                <div class="sun-times">
                    <div>↑ Sunrise <strong>${sunrise}</strong></div>
                    <div>↓ Sunset  <strong>${sunset}</strong></div>
                </div>
            `;
        });   
    } catch (err) {
        console.error(err);
        document.querySelector(".main-container").innerHTML = `<div class="box"><h2>Weather unavailable</h2></div>`;
    }
}

// Based on the waether and time of the day, set the correct animated background 
function setDynamicBackground(code, isNight) {
    document.body.className = '';
    document.querySelectorAll('.clouds,.rain,.snow,.stars,.lightning').forEach(el => el.remove());

    if (isNight) {
        document.body.classList.add('bg-night');
        document.body.insertAdjacentHTML('afterbegin', '<div class="stars active"></div>');
    if (code >= 8000) {
        document.body.classList.add('bg-thunder');
        document.body.insertAdjacentHTML('afterbegin', '<div class="lightning active"></div><div class="rain active"></div>');
    } else if (code >= 6000) {
        document.body.insertAdjacentHTML('afterbegin', '<div class="snow active"></div>');
    }
    else if (code >= 4000) {
        document.body.insertAdjacentHTML('afterbegin', '<div class="rain active"></div>');
    }
    } else {
        if (code >= 8000) {
            document.body.classList.add('bg-thunder');
            document.body.insertAdjacentHTML('afterbegin', '<div class="lightning active"></div><div class="rain active"></div>');
        } else if (code >= 6000) {
            document.body.classList.add('bg-snow');
            document.body.insertAdjacentHTML('afterbegin', '<div class="snow active"></div>');
        } else if (code >= 4000) {
            document.body.classList.add('bg-rain');
            document.body.insertAdjacentHTML('afterbegin', '<div class="rain active"></div>');
        } else if (code >= 1001) {
            document.body.classList.add('bg-cloudy');
            document.body.insertAdjacentHTML('afterbegin', '<div class="clouds active"></div>');
        } else {
            document.body.classList.add('bg-sunny');
        }
    }
}

// Function used to convert the wind direction degress to a compass point
function windDirection(deg) {
    if (deg === undefined) {
        return 'Calm';
    }
    const d = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return d[Math.round(deg / 22.5) % 16];
}