function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSection = document.getElementById("recent-searches-section");
    this.recentContainer = document.getElementById("recent-searches-container");
    this.clearBtn = document.getElementById("clear-history-btn");

    this.recentSearches = [];
    this.maxRecent = 5;

    this.init();
}

/* ================= INIT ================= */

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    }.bind(this));

    this.clearBtn.addEventListener("click", this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

/* ================= SEARCH ================= */

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return;

    this.getWeather(city);
    this.cityInput.value = "";
};

WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [current, forecast] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(current.data);
        this.displayForecast(forecast);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {
        this.showError("City not found or API error.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ================= FORECAST ================= */

WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

WeatherApp.prototype.processForecastData = function (data) {
    return data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    ).slice(0, 5);
};

WeatherApp.prototype.displayForecast = function (data) {
    const daily = this.processForecastData(data);

    const html = daily.map(day => {
        const date = new Date(day.dt * 1000);
        const name = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(day.main.temp);
        const desc = day.weather[0].description;
        const icon = day.weather[0].icon;

        return `
            <div class="forecast-card">
                <h4>${name}</h4>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
                <p>${temp}°C</p>
                <p>${desc}</p>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">${html}</div>
        </div>
    `;
};

/* ================= DISPLAY ================= */

WeatherApp.prototype.displayWeather = function (data) {
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icon = data.weather[0].icon;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}</h2>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
            <h1>${temp}°C</h1>
            <p>${desc}</p>
        </div>
    `;
};

/* ================= LOADING & ERROR ================= */

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
};

WeatherApp.prototype.showError = function (msg) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>❌ Error</h3>
            <p>${msg}</p>
        </div>
    `;
};

/* ================= LOCAL STORAGE ================= */

WeatherApp.prototype.saveRecentSearch = function (city) {
    const formatted = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(formatted);
    if (index > -1) this.recentSearches.splice(index, 1);

    this.recentSearches.unshift(formatted);

    if (this.recentSearches.length > this.maxRecent)
        this.recentSearches.pop();

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));

    this.displayRecentSearches();
};

WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");
    if (saved) this.recentSearches = JSON.parse(saved);
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSection.style.display = "none";
        return;
    }

    this.recentSection.style.display = "block";

    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;
        btn.addEventListener("click", () => this.getWeather(city));
        this.recentContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {
    const last = localStorage.getItem("lastCity");
    if (last) this.getWeather(last);
};

WeatherApp.prototype.clearHistory = function () {
    if (confirm("Clear all recent searches?")) {
        this.recentSearches = [];
        localStorage.removeItem("recentSearches");
        this.displayRecentSearches();
    }
};

/* ================= CREATE APP ================= */

const app = new WeatherApp("8d3d70587f810022febcef8859af1872");
