// env.js used for loading the API key from .env without exposing publicly

document.addEventListener('DOMContentLoaded', () => {
    // Fetches the .env key with cache-busting to avoid stale reads
    fetch('env.config?' + Date.now())
      .then(r => {
        // If the .env doesnt exist or returns 404/403, return fail
        if (!r.ok) {
            throw new Error(`Cannot read .env (HTTP ${r.status})`);
        }
        return r.text();
      })
      .then(text => {
        // Only reads the first non-empty line
        const line = text.trim().split('\n')[0];
        if (!line.includes('=')) {
            throw new Error('.env malformed, no = found');
        }
        // Safely parse and split only on first '=' in key value if need
        const eqIndex = line.indexOf('=');
        const keyName = line.substring(0, eqIndex).trim();
        let keyValue = line.substring(eqIndex + 1).trim();
        keyValue = keyValue.replace(/^["']|["']$/g, '');

        // Validates that the key recieved is actually correct
        if (keyName !== 'WEATHER_API_KEY' || !keyValue) {
            throw new Error('Invalid key format');
        }
        // Key retrieval was a success so expose and let script.js use it
        window.ENV = { WEATHER_API_KEY: keyValue };
        console.log('API key loaded (first 10 chars):', keyValue.substring(0, 10) + '...');

        // Starts the process of fetching the weather once the key is ready
        if (typeof reallyStartWeather === 'function') {
            reallyStartWeather();
        }
      })
      .catch(err => {
        console.error('.env failed:', err);
        // Error handling
        document.body.innerHTML = `<h1 style="color:red;text-align:center;padding:50px">
          .env error: ${err.message}<br><br>
        </h1>`;
      });
});