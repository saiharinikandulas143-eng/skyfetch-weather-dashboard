const API_KEY = "8d3d70587f810022febcef8859af1872";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const weatherDisplay = document.getElementById("weather-display");
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

// ==========================
// Fetch Weather (Async/Await)
// ==========================
async function getWeather(city) {

    showLoading();
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {

        if (error.response && error.response.status === 404) {
            showError("City not found. Please check spelling and try again.");
        } else {
            showError("Something went wrong. Please try again later.");
        }

    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
    }
}

// ==========================
// Display Weather
// ==========================
function displayWeather(data) {

    const weatherHTML = `
        <h2>${data.name}</h2>
        <h3>${data.main.temp}°C</h3>
        <p>${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
    `;

    weatherDisplay.innerHTML = weatherHTML;

    cityInput.focus();
}

// ==========================
// Show Error
// ==========================
function showError(message) {

    const errorHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
    `;

    weatherDisplay.innerHTML = errorHTML;
}

// ==========================
// Show Loading
// ==========================
function showLoading() {

    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    weatherDisplay.innerHTML = loadingHTML;
}

// ==========================
// Search Button Click
// ==========================
searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name must be at least 2 characters.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});

// ==========================
// Enter Key Support
// ==========================
cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

// ==========================
// Initial Welcome Message
// ==========================
weatherDisplay.innerHTML = `
    <p>Enter a city name to get started 🌍</p>
`;
