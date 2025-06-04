// ShoreSquad App - Optimized for Performance
class ShoreSquadApp {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.cleanupSpots = [];
        this.events = [];
        this.crew = [];
        this.isMapLoaded = false;
        this.isWeatherLoaded = false;
        
        this.init();
    }

    async init() {
        try {
            // Show loading
            this.showLoading();
            
            // Initialize only essential components first
            this.initializeNavigation();
            this.setupEventListeners();
            
            // Load critical content immediately
            await this.loadCriticalContent();
            
            // Hide loading for main content
            this.hideLoading();
            
            // Setup lazy loading for heavy components
            this.setupLazyLoading();
            
            console.log('🏖️ ShoreSquad app initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoading();
        }
    }

    async loadCriticalContent() {
        // Load essential UI components only
        this.loadSampleData();
        this.renderEvents();
        
        // Fast content load simulation
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    setupLazyLoading() {
        // Load map only when map section is visible
        const mapSection = document.getElementById('map');
        if (mapSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isMapLoaded) {
                        this.initializeMap();
                        this.isMapLoaded = true;
                        observer.unobserve(mapSection);
                    }
                });
            });
            observer.observe(mapSection);
        }

        // Load weather when needed
        const weatherBtn = document.querySelector('[data-action="check-weather"]');
        if (weatherBtn) {
            weatherBtn.addEventListener('click', () => {
                if (!this.isWeatherLoaded) {
                    this.initializeWeather();
                    this.isWeatherLoaded = true;
                }
            });
        }
    }

    initializeNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupEventListeners() {
        // Get Started button
        const getStartedBtn = document.querySelector('.cta-button');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.scrollToSection('#map');
            });
        }

        // Join Crew button
        const joinCrewBtn = document.querySelector('#join-crew-btn');
        if (joinCrewBtn) {
            joinCrewBtn.addEventListener('click', () => {
                this.showMessage('Feature coming soon! Join our newsletter for updates.', 'info');
            });
        }

        // Quick action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'check-weather':
                this.showWeatherInfo();
                break;
            case 'find-events':
                this.scrollToSection('#events');
                break;
            case 'suggest-spot':
                this.showSpotSuggestion();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    async initializeMap() {
        try {
            // Show map loading
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="loading-spinner">Loading map...</div>';
            }

            // Load Leaflet dynamically
            if (typeof L === 'undefined') {
                await this.loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
            }

            // Initialize map
            this.map = L.map('map-container', {
                zoomControl: true,
                scrollWheelZoom: false
            }).setView([40.7128, -74.0060], 10);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Add cleanup spots
            this.addCleanupSpots();

            console.log('🗺️ Map initialized');
        } catch (error) {
            console.error('Failed to initialize map:', error);
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="error-message">Failed to load map. Please try again later.</div>';
            }
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    addCleanupSpots() {
        if (!this.map) return;

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-icon">🏖️</div>',
            iconSize: [30, 30]
        });

        this.cleanupSpots.forEach(spot => {
            const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
                .addTo(this.map)
                .bindPopup(`
                    <div class="popup-content">
                        <h3>${spot.name}</h3>
                        <p>${spot.description}</p>
                        <span class="priority-badge priority-${spot.priority}">${spot.priority} priority</span>
                    </div>
                `);
        });
    }    async initializeWeather() {
        try {
            // Show loading state
            this.showWeatherLoading();
            
            // Fetch both current and 4-day forecast data
            const [currentWeather, forecast4Day] = await Promise.all([
                this.fetchCurrentWeather(),
                this.fetch4DayForecast()
            ]);
            
            this.updateWeatherDisplay({ current: currentWeather, forecast: forecast4Day });
        } catch (error) {
            console.error('Failed to load weather:', error);
            this.showMessage('Weather data unavailable. Please try again later.', 'error');
            this.hideWeatherLoading();
        }
    }    async fetchCurrentWeather() {
        try {
            const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast');
            if (!response.ok) throw new Error('Failed to fetch current weather');
            
            const data = await response.json();
            const currentData = data.items[0];
            
            return {
                temperature: {
                    current: Math.round((currentData.general.temperature.low + currentData.general.temperature.high) / 2),
                    low: currentData.general.temperature.low,
                    high: currentData.general.temperature.high
                },
                condition: currentData.general.forecast,
                humidity: {
                    low: currentData.general.relative_humidity.low,
                    high: currentData.general.relative_humidity.high
                },
                wind: {
                    speed: {
                        low: currentData.general.wind.speed.low,
                        high: currentData.general.wind.speed.high
                    },
                    direction: currentData.general.wind.direction
                },
                periods: currentData.periods,
                updateTime: new Date(currentData.update_timestamp)
            };
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    async fetch4DayForecast() {
        try {
            const response = await fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast');
            if (!response.ok) throw new Error('Failed to fetch 4-day forecast');
            
            const data = await response.json();
            return data.items[0].forecasts.map(day => ({
                date: new Date(day.date),
                dateString: day.date,
                forecast: day.forecast,
                temperature: day.temperature,
                humidity: day.relative_humidity,
                wind: day.wind
            }));
        } catch (error) {
            console.error('Error fetching 4-day forecast:', error);
            throw error;
        }    }

    updateWeatherDisplay({ current, forecast }) {
        const weatherSection = document.querySelector('.weather-widget');
        if (!weatherSection) return;

        // Helper function to get weather emoji
        const getWeatherEmoji = (condition) => {
            const conditionLower = condition.toLowerCase();
            if (conditionLower.includes('thunder')) return '⛈️';
            if (conditionLower.includes('rain') || conditionLower.includes('shower')) return '🌧️';
            if (conditionLower.includes('cloudy')) return '☁️';
            if (conditionLower.includes('partly cloudy')) return '⛅';
            if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return '☀️';
            return '🌤️';
        };

        const formatDate = (date) => {
            return date.toLocaleDateString('en-SG', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        };

        weatherSection.innerHTML = `
            <div class="weather-container">
                <div class="weather-header">
                    <h3>🌊 Singapore Weather Forecast</h3>
                    <p class="update-time">Updated: ${current.updateTime.toLocaleTimeString('en-SG', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}</p>
                </div>
                
                <div class="current-weather">
                    <div class="current-main">
                        <div class="temp-display">
                            <span class="current-temp">${current.temperature.current}°C</span>
                            <span class="temp-range">${current.temperature.low}° - ${current.temperature.high}°</span>
                        </div>
                        <div class="condition-display">
                            <span class="weather-emoji">${getWeatherEmoji(current.condition)}</span>
                            <span class="condition-text">${current.condition}</span>
                        </div>
                    </div>
                    
                    <div class="weather-details">
                        <div class="detail-item">
                            <span class="detail-label">💨 Wind</span>
                            <span class="detail-value">${current.wind.speed.low}-${current.wind.speed.high} km/h ${current.wind.direction}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">💧 Humidity</span>
                            <span class="detail-value">${current.humidity.low}-${current.humidity.high}%</span>
                        </div>
                    </div>
                </div>

                <div class="forecast-section">
                    <h4>4-Day Forecast</h4>
                    <div class="forecast-grid">
                        ${forecast.map(day => `
                            <div class="forecast-card">
                                <div class="forecast-date">${formatDate(day.date)}</div>
                                <div class="forecast-emoji">${getWeatherEmoji(day.forecast)}</div>
                                <div class="forecast-temps">
                                    <span class="high-temp">${day.temperature.high}°</span>
                                    <span class="low-temp">${day.temperature.low}°</span>
                                </div>
                                <div class="forecast-condition">${day.forecast}</div>
                                <div class="forecast-wind">💨 ${day.wind.speed.low}-${day.wind.speed.high} km/h</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="beach-recommendation">
                    <h4>🏖️ Beach Cleanup Recommendation</h4>
                    <p class="recommendation-text">
                        ${this.getBeachRecommendation(current, forecast)}
                    </p>
                </div>
            </div>
        `;

        this.hideWeatherLoading();
    }

    getBeachRecommendation(current, forecast) {
        const currentCondition = current.condition.toLowerCase();
        const todayForecast = forecast[0];
        
        if (currentCondition.includes('thunder') || currentCondition.includes('heavy rain')) {
            return "⚠️ Not ideal for beach cleanup due to thunderstorms. Stay safe and wait for better weather!";
        } else if (currentCondition.includes('rain') || currentCondition.includes('shower')) {
            return "🌧️ Light rain may make cleanup challenging. Consider rescheduling or bringing waterproof gear.";
        } else if (current.wind.speed.high > 25) {
            return "💨 Strong winds today. Great for cleanup but bring secure containers for collected trash.";
        } else if (currentCondition.includes('sunny') || currentCondition.includes('partly cloudy')) {
            return "☀️ Perfect weather for beach cleanup! Don't forget sunscreen and plenty of water.";
        } else {
            return "🌤️ Good conditions for beach cleanup. Check the 4-day forecast to plan your next cleanup event.";
        }
    }

    showWeatherLoading() {
        const weatherSection = document.querySelector('.weather-widget');
        if (weatherSection) {
            weatherSection.innerHTML = `
                <div class="weather-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading Singapore weather data...</p>
                </div>
            `;
        }
    }

    hideWeatherLoading() {
        // Loading state is replaced by weather content
    }

    showWeatherInfo() {
        if (!this.isWeatherLoaded) {
            this.initializeWeather();
            this.isWeatherLoaded = true;
        } else {
            this.scrollToSection('.weather-widget');
        }
    }

    loadSampleData() {
        // Sample cleanup spots
        this.cleanupSpots = [
            { lat: 40.7589, lng: -73.9851, name: 'Central Park Lake', priority: 'high', description: 'Monthly cleanup event' },
            { lat: 40.6892, lng: -74.0445, name: 'Brooklyn Bridge Park', priority: 'medium', description: 'Weekly volunteer cleanup' },
            { lat: 40.5795, lng: -74.1502, name: 'Staten Island Beach', priority: 'low', description: 'Weekend cleanup scheduled' }
        ];

        // Sample events
        this.events = [
            {
                id: 1,
                title: 'Brooklyn Bridge Park Cleanup',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                participants: 24,
                location: 'Brooklyn Bridge Park'
            },
            {
                id: 2,
                title: 'Central Park Lake Restoration',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                participants: 18,
                location: 'Central Park'
            }
        ];
    }

    renderEvents() {
        const eventsContainer = document.querySelector('.events-grid');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = this.events.map(event => `
            <div class="event-card" role="article" tabindex="0">
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <span class="participants">${event.participants} going</span>
                </div>
                <div class="event-details">
                    <p class="location">📍 ${event.location}</p>
                    <p class="date">📅 ${event.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}</p>
                </div>
                <button class="join-event-btn" onclick="app.joinEvent(${event.id})">
                    Join Event
                </button>
            </div>
        `).join('');
    }

    joinEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.participants++;
            this.renderEvents();
            this.showMessage(`You've joined "${event.title}"! Check your email for details.`, 'success');
        }
    }

    showSpotSuggestion() {
        const spotName = prompt('Suggest a beach cleanup location:');
        if (spotName) {
            this.showMessage(`Thanks for suggesting "${spotName}"! Our team will review it.`, 'success');
        }
    }

    showMessage(message, type = 'info') {
        const messageContainer = document.querySelector('.message-container') || this.createMessageContainer();
        
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <span>${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        messageContainer.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }

    createMessageContainer() {
        const container = document.createElement('div');
        container.className = 'message-container';
        document.body.appendChild(container);
        return container;
    }

    showLoading() {
        const loader = document.querySelector('.loading-screen');
        if (loader) {
            loader.style.display = 'flex';
            loader.setAttribute('aria-hidden', 'false');
        }
    }

    hideLoading() {
        const loader = document.querySelector('.loading-screen');
        if (loader) {
            loader.style.display = 'none';
            loader.setAttribute('aria-hidden', 'true');
        }
    }
}

// Initialize app when DOM is loaded
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new ShoreSquadApp();
    });
} else {
    app = new ShoreSquadApp();
}
