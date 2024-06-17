document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '911951cd7e8cfbfcad597b178cdaa336'; //  API від OpenWeatherMap
    const regionSelector = document.getElementById('region');
    const updateWeatherBtn = document.getElementById('update-weather-btn');
    const showMapBtn = document.getElementById('show-map-btn');
    const dataDisplay = document.getElementById('data-display');
    const weatherForecast = document.getElementById('weather-forecast');
    const mapDiv = document.getElementById('map');
    let map;

    const regions = {
        'Kyiv': { lat: 50.4501, lon: 30.5234 },
        'Lviv': { lat: 49.8397, lon: 24.0297 },
        'Odessa': { lat: 46.4825, lon: 30.7233 },
    };

    showMapBtn.addEventListener('click', function() {
        if (!map) {
            map = L.map('map').setView([48.3794, 31.1656], 6); // Центр України
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
        mapDiv.style.display = 'block';
        map.invalidateSize();
    });

    updateWeatherBtn.addEventListener('click', function() {
        const selectedRegion = regionSelector.value;
        fetchWeatherForRegion(selectedRegion);
    });

    function fetchWeatherForRegion(region) {
        const { lat, lon } = regions[region];
        fetchWeather(lat, lon, region);
    }

    function fetchWeather(lat, lon, region) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                displayWeather(data, lat, lon, region);
            })
            .catch(error => {
                console.error('Помилка при отриманні прогнозу погоди:', error);
                displayWeatherError();
            });
    }

    function displayWeather(weatherData, lat, lon, region) {
        weatherForecast.innerHTML = '';
        if (map) {
            map.setView([lat, lon], 10);
        }

        const date = new Date(weatherData.dt * 1000);
        const day = date.toLocaleDateString('uk-UA', { weekday: 'long' });
        const dayDate = date.toLocaleDateString('uk-UA', { day: 'numeric' });
        const month = date.toLocaleDateString('uk-UA', { month: 'long' });
        const weatherCondition = weatherData.weather[0].description;
        const temp = weatherData.main.temp;

        const weatherDay = document.createElement('div');
        weatherDay.className = 'weather-day';
        weatherDay.innerHTML = `
            <div class="day-info">
                <div class="day-name">${day}</div>
                <div class="day-date">${dayDate}</div>
                <div class="day-month">${month}</div>
            </div>
            <div class="weather-info">
                <img src="${getWeatherIcon(weatherData.weather[0].icon)}" alt="${weatherCondition}">
                <div class="temperature-info">
                    <div class="temperature">${Math.round(temp)}°C</div>
                    <div class="weather-condition">${weatherCondition}</div>
                </div>
            </div>
        `;

        weatherDay.addEventListener('click', () => {
            displayAdditionalInfo(weatherData);
        });

        weatherForecast.appendChild(weatherDay);

        if (map) {
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${region}</b><br>${weatherCondition}<br>${Math.round(temp)}°C`)
                .openPopup();
        }
    }

    function displayWeatherError() {
        weatherForecast.innerHTML = '<p>Не вдалося отримати прогноз погоди для цього регіону.</p>';
    }

    function displayAdditionalInfo(weatherData) {
        const additionalInfo = document.getElementById('additional-info');
        const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('uk-UA');
        const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('uk-UA');
        additionalInfo.innerHTML = `
            <h3>Додаткова інформація</h3>
            <p>Схід сонця: ${sunrise}</p>
            <p>Захід сонця: ${sunset}</p>
        `;
        additionalInfo.style.display = 'block';
    }

    function getWeatherIcon(icon) {
        return `http://openweathermap.org/img/wn/${icon}.png`;
    }
});
