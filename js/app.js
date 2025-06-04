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
    }

    async initializeWeather() {
        try {
            // Simulate weather API call
            const weatherData = await this.fetchWeatherData();
            this.updateWeatherDisplay(weatherData);
        } catch (error) {
            console.error('Failed to load weather:', error);
            this.showMessage('Weather data unavailable. Please try again later.', 'error');
        }
    }    async fetchWeatherData() {
        // Simulate API call with realistic data
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    temperature: Math.floor(Math.random() * 10 + 18),
                    condition: ['Sunny', 'Partly Cloudy', 'Overcast'][Math.floor(Math.random() * 3)],
                    windSpeed: Math.floor(Math.random() * 16 + 8),
                    humidity: Math.floor(Math.random() * 30 + 50)
                });
            }, 500);
        });
    }    updateWeatherDisplay(weatherData) {
        const weatherSection = document.querySelector('.weather-widget');
        if (weatherSection) {
            weatherSection.innerHTML = `
                <h3>Current Weather</h3>
                <div class="weather-info">
                    <div class="temp">${weatherData.temperature}°C</div>
                    <div class="condition">${weatherData.condition}</div>
                    <div class="details">
                        <span>Wind: ${weatherData.windSpeed}km/h</span>
                        <span>Humidity: ${weatherData.humidity}%</span>
                    </div>
                </div>
            `;
        }
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