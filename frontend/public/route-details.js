// route-details.js - Route details page with Google Maps
let currentTransport = null;
let routeMap = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUserGreeting();
    loadRouteDetails();
    setupEventListeners();
});

function setupEventListeners() {
    const backBtn = document.getElementById('backBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const bookBtn = document.getElementById('bookBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (backBtn) backBtn.addEventListener('click', () => window.history.back());
    if (favoriteBtn) favoriteBtn.addEventListener('click', addToFavorites);
    if (bookBtn) bookBtn.addEventListener('click', handleBooking);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function displayUserGreeting() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const greeting = document.getElementById('userGreeting');
        if (greeting) {
            greeting.textContent = `Welcome, ${user.name}!`;
        }
    }
}

async function loadRouteDetails() {
    try {
        const params = new URLSearchParams(window.location.search);
        const transportId = params.get('id');

        if (!transportId) {
            throw new Error('No route selected');
        }

        const response = await apiCall(ROUTE_ENDPOINTS.GET_ROUTE(transportId));
        currentTransport = response.data;

        console.log('Transport Data:', currentTransport);

        displayRouteInfo();
        displayStops();
        
        // Initialize map after DOM is ready
        setTimeout(() => {
            initializeMap();
        }, 500);

    } catch (error) {
        console.error('Load error:', error);
        const detailsContent = document.getElementById('detailsContent');
        if (detailsContent) {
            detailsContent.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    }
}

function displayRouteInfo() {
    if (!currentTransport) return;

    const badgeClass = currentTransport.transportType;
    const badgeText = currentTransport.transportType.toUpperCase();

    const routeTitle = document.getElementById('routeTitle');
    const transportBadge = document.getElementById('transportBadge');
    const transportNumber = document.getElementById('transportNumber');
    const departureTime = document.getElementById('departureTime');
    const arrivalTime = document.getElementById('arrivalTime');
    const fare = document.getElementById('fare');
    const availableSeats = document.getElementById('availableSeats');

    if (routeTitle) routeTitle.textContent = `${currentTransport.source} → ${currentTransport.destination}`;
    if (transportBadge) {
        transportBadge.textContent = badgeText;
        transportBadge.className = `badge ${badgeClass}`;
    }
    if (transportNumber) transportNumber.textContent = currentTransport.number;
    if (departureTime) departureTime.textContent = currentTransport.departureTime;
    if (arrivalTime) arrivalTime.textContent = currentTransport.arrivalTime;
    if (fare) fare.textContent = `₹${currentTransport.fare}`;
    if (availableSeats) availableSeats.textContent = `${currentTransport.availableSeats} / ${currentTransport.capacity}`;

    const duration = currentTransport.duration || '90';
    const stops = currentTransport.schedule ? currentTransport.schedule.length : '4';

    const detailsHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
            <div>
                <label>Transport Type</label>
                <p>${currentTransport.transportType.charAt(0).toUpperCase() + currentTransport.transportType.slice(1)}</p>
            </div>
            <div>
                <label>Total Duration</label>
                <p>${duration} minutes</p>
            </div>
            <div>
                <label>Number of Stops</label>
                <p>${stops}</p>
            </div>
            <div>
                <label>Vehicle Capacity</label>
                <p>${currentTransport.capacity} passengers</p>
            </div>
        </div>
    `;

    const detailsContent = document.getElementById('detailsContent');
    if (detailsContent) {
        detailsContent.innerHTML = detailsHTML;
    }
}

function displayStops() {
    if (!currentTransport || !currentTransport.schedule) return;

    const stopsList = document.getElementById('stopsList');
    if (!stopsList) return;

    stopsList.innerHTML = currentTransport.schedule
        .map((stop, index) => `
            <div class="stop-item">
                <div class="stop-number">${index + 1}</div>
                <div class="stop-info">
                    <h4>${stop.stopName}</h4>
                    <div class="stop-time">
                        ${stop.arrivalTime ? `📍 Arrive: ${stop.arrivalTime}` : ''}
                        ${stop.departureTime && stop.departureTime !== stop.arrivalTime ? `<br/>🚌 Depart: ${stop.departureTime}` : ''}
                    </div>
                </div>
            </div>
        `)
        .join('');
}

function initializeMap() {
    const mapEl = document.getElementById('routeMap');
    if (!mapEl) return;
    if (!currentTransport || !currentTransport.schedule || !currentTransport.schedule.length) {
        mapEl.innerHTML = '<p style="padding:20px;">No map data</p>';
        return;
    }

    // create Leaflet map
    const first = currentTransport.schedule[0];
    const last = currentTransport.schedule[currentTransport.schedule.length - 1];
    const centerLat = (parseFloat(first.lat) + parseFloat(last.lat)) / 2;
    const centerLng = (parseFloat(first.lng) + parseFloat(last.lng)) / 2;

    const map = L.map(mapEl).setView([centerLat, centerLng], 8);

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // build polyline and markers
    const latlngs = [];
    currentTransport.schedule.forEach((stop, idx) => {
        const lat = parseFloat(stop.lat);
        const lng = parseFloat(stop.lng);
        latlngs.push([lat, lng]);

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(
            `<strong>${stop.stopName}</strong><br>` +
            (stop.arrivalTime ? `Arr: ${stop.arrivalTime}<br>` : '') +
            (stop.departureTime ? `Dep: ${stop.departureTime}` : '')
        );
    });

    L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(map);

    // fit view to route
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50] });
}

async function addToFavorites() {
    try {
        const source = currentTransport.source;
        const destination = currentTransport.destination;
        const transportId = currentTransport._id;

        await apiCall(FAVORITE_ENDPOINTS.CREATE, {
            method: 'POST',
            body: JSON.stringify({
                source,
                destination,
                transportId
            })
        });

        const btn = document.getElementById('favoriteBtn');
        if (btn) {
            btn.textContent = '♥ Added to Favorites';
            btn.disabled = true;
        }

        alert('✅ Route added to favorites!');
    } catch (error) {
        alert('Failed to add to favorites: ' + error.message);
    }
}

function handleBooking() {
    if (currentTransport.availableSeats <= 0) {
        alert('❌ No seats available for this route');
        return;
    }

    alert(`
    ✅ Booking Confirmed!
    
    Route: ${currentTransport.number}
    From: ${currentTransport.source}
    To: ${currentTransport.destination}
    Departure: ${currentTransport.departureTime}
    Arrival: ${currentTransport.arrivalTime}
    Fare: ₹${currentTransport.fare}
    
    This is a demo application.
    `);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}