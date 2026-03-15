// route-details.js - Route details page with Google Maps
let currentTransport = null;
let routeMap = null;

const CITY_COORDINATES = {
    Chennai: [13.0827, 80.2707],
    Coimbatore: [11.0168, 76.9558],
    Madurai: [9.9252, 78.1198],
    Tiruchirappalli: [10.7905, 78.7047],
    Salem: [11.6643, 78.1460],
    Erode: [11.3410, 77.7172],
    Tirunelveli: [8.7139, 77.7567],
    Vellore: [12.9165, 79.1325],
    Thoothukudi: [8.7642, 78.1348],
    Dindigul: [10.3673, 77.9803],
    Thanjavur: [10.7867, 79.1378],
    Kumbakonam: [10.9601, 79.3845],
    Cuddalore: [11.7447, 79.7680],
    Nagercoil: [8.1833, 77.4119],
    Kanyakumari: [8.0883, 77.5385],
    Tirupur: [11.1085, 77.3411],
    Tiruppur: [11.1085, 77.3411],
    Karur: [10.9577, 78.0766],
    Namakkal: [11.2194, 78.1674],
    Pudukkottai: [10.3833, 78.8000],
    Sivaganga: [9.8470, 78.4836],
    Virudhunagar: [9.5851, 77.9579],
    Ramanathapuram: [9.3639, 78.8395],
    Tenkasi: [8.9590, 77.3152],
    Tiruvannamalai: [12.2253, 79.0747],
    Villupuram: [11.9401, 79.4861],
    Kallakurichi: [11.7401, 78.9596],
    Ranipet: [12.9273, 79.3332],
    Chengalpattu: [12.6918, 79.9766],
    Kanchipuram: [12.8342, 79.7036],
    Thiruvallur: [13.1439, 79.9085],
    Ariyalur: [11.1385, 79.0756],
    Perambalur: [11.2333, 78.8833],
    Nagapattinam: [10.7656, 79.8428],
    Mayiladuthurai: [11.1035, 79.6550],
    Karaikudi: [10.0666, 78.7672],
    Sivakasi: [9.4496, 77.7970],
    Kovilpatti: [9.1717, 77.8689],
    Sankarankovil: [9.1732, 77.5416],
    Srirangam: [10.8624, 78.6932],
    Manapparai: [10.6076, 78.4252],
    Pollachi: [10.6582, 77.0082],
    Palani: [10.4503, 77.5200],
    Oddanchatram: [10.4853, 77.7480],
    Batlagundu: [10.1635, 77.7582],
    Paramakudi: [9.5463, 78.5907],
    Mudukulathur: [9.3415, 78.5132],
    Tiruvottiyur: [13.1609, 80.3009],
    Ambattur: [13.1143, 80.1548],
    Avadi: [13.1147, 80.1018],
    Bangalore: [12.9716, 77.5946],
    Kochi: [9.9312, 76.2673],
    Thiruvananthapuram: [8.5241, 76.9366],
    Hyderabad: [17.3850, 78.4867],
    Mysuru: [12.2958, 76.6394],
    Mumbai: [19.0760, 72.8777],
    Delhi: [28.6139, 77.2090],
    Pune: [18.5204, 73.8567]
};

function getCityCoordinates(cityName) {
    if (!cityName) return null;

    const target = cityName.trim().toLowerCase();
    const matchedCity = Object.keys(CITY_COORDINATES).find(
        city => city.toLowerCase() === target
    );

    if (!matchedCity) return null;

    const [lat, lng] = CITY_COORDINATES[matchedCity];
    return { stopName: matchedCity, lat, lng };
}

function parseTimeToMinutes(timeValue) {
    if (timeValue === null || timeValue === undefined || timeValue === '') return null;

    if (typeof timeValue === 'number' && Number.isFinite(timeValue)) {
        return ((timeValue % 1440) + 1440) % 1440;
    }

    const input = String(timeValue).trim();
    if (!input) return null;

    const twelveHourMatch = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (twelveHourMatch) {
        let hours = parseInt(twelveHourMatch[1], 10);
        const minutes = parseInt(twelveHourMatch[2], 10);
        const meridiem = twelveHourMatch[3].toUpperCase();

        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
        if (hours === 12) hours = 0;
        if (meridiem === 'PM') hours += 12;

        return (hours * 60) + minutes;
    }

    const twentyFourHourMatch = input.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
        const hours = parseInt(twentyFourHourMatch[1], 10);
        const minutes = parseInt(twentyFourHourMatch[2], 10);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
        return (hours * 60) + minutes;
    }

    return null;
}

function minutesTo12Hour(totalMinutes) {
    const normalizedMinutes = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
    const hours24 = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    const meridiem = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

function to12HourFormat(timeValue) {
    const minutes = parseTimeToMinutes(timeValue);
    if (minutes === null) return timeValue || '-';
    return minutesTo12Hour(minutes);
}

function findNearestCity(targetLat, targetLng, excludedCities) {
    let nearest = null;
    let minDistance = Infinity;

    Object.entries(CITY_COORDINATES).forEach(([city, coords]) => {
        if (excludedCities.has(city.toLowerCase())) return;

        const [lat, lng] = coords;
        const distance = Math.pow(lat - targetLat, 2) + Math.pow(lng - targetLng, 2);

        if (distance < minDistance) {
            minDistance = distance;
            nearest = { stopName: city, lat, lng };
        }
    });

    return nearest;
}

function calculateDurationMinutes(departureMinutes) {
    const durationFromField = Number(currentTransport.duration);
    if (Number.isFinite(durationFromField) && durationFromField > 0) {
        return durationFromField;
    }

    const arrivalMinutes = parseTimeToMinutes(currentTransport.arrivalTime);
    if (departureMinutes !== null && arrivalMinutes !== null) {
        let difference = arrivalMinutes - departureMinutes;
        if (difference <= 0) difference += 1440;
        return difference;
    }

    return 240;
}

function getFallbackRouteStops() {
    if (!currentTransport) return [];

    const sourceCoords = getCityCoordinates(currentTransport.source);
    const destinationCoords = getCityCoordinates(currentTransport.destination);

    if (!sourceCoords || !destinationCoords) return [];

    const departureMinutes = parseTimeToMinutes(currentTransport.departureTime) ?? 8 * 60;
    const durationMinutes = calculateDurationMinutes(departureMinutes);
    const segmentMinutes = durationMinutes / 4;

    const excludedCities = new Set([
        (currentTransport.source || '').trim().toLowerCase(),
        (currentTransport.destination || '').trim().toLowerCase()
    ]);

    const intermediateStops = [0.25, 0.5, 0.75].map((fraction, index) => {
        const targetLat = sourceCoords.lat + ((destinationCoords.lat - sourceCoords.lat) * fraction);
        const targetLng = sourceCoords.lng + ((destinationCoords.lng - sourceCoords.lng) * fraction);

        const nearestCity = findNearestCity(targetLat, targetLng, excludedCities);
        if (nearestCity) {
            excludedCities.add(nearestCity.stopName.toLowerCase());
        }

        const stopLat = nearestCity ? nearestCity.lat : targetLat;
        const stopLng = nearestCity ? nearestCity.lng : targetLng;
        const stopName = nearestCity ? nearestCity.stopName : `Intermediate Stop ${index + 1}`;

        const arrivalMinutes = departureMinutes + Math.round(segmentMinutes * (index + 1));
        const departureAtStopMinutes = arrivalMinutes + 5;

        return {
            stopName,
            lat: stopLat,
            lng: stopLng,
            arrivalTime: minutesTo12Hour(arrivalMinutes),
            departureTime: minutesTo12Hour(departureAtStopMinutes)
        };
    });

    return [
        {
            stopName: currentTransport.source,
            lat: sourceCoords.lat,
            lng: sourceCoords.lng,
            arrivalTime: '',
            departureTime: minutesTo12Hour(departureMinutes)
        },
        ...intermediateStops,
        {
            stopName: currentTransport.destination,
            lat: destinationCoords.lat,
            lng: destinationCoords.lng,
            arrivalTime: minutesTo12Hour(departureMinutes + durationMinutes),
            departureTime: ''
        }
    ];
}

function getRouteStops() {
    if (!currentTransport) return [];

    if (Array.isArray(currentTransport.schedule) && currentTransport.schedule.length > 0) {
        return currentTransport.schedule.map((stop, index) => ({
            stopName: stop.stopName || `Stop ${index + 1}`,
            arrivalTime: stop.arrivalTime || '',
            departureTime: stop.departureTime || '',
            lat: parseFloat(stop.lat),
            lng: parseFloat(stop.lng)
        }));
    }

    return getFallbackRouteStops();
}

function getMapPoints() {
    const routeStops = getRouteStops();
    const routeMapPoints = routeStops
        .map(stop => ({
            ...stop,
            lat: parseFloat(stop.lat),
            lng: parseFloat(stop.lng)
        }))
        .filter(stop => !Number.isNaN(stop.lat) && !Number.isNaN(stop.lng));

    if (routeMapPoints.length >= 2) {
        return routeMapPoints;
    }

    const fallbackPoints = getFallbackRouteStops()
        .map(stop => ({
            ...stop,
            lat: parseFloat(stop.lat),
            lng: parseFloat(stop.lng)
        }))
        .filter(stop => !Number.isNaN(stop.lat) && !Number.isNaN(stop.lng));

    return fallbackPoints.length >= 2 ? fallbackPoints : [];
}

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
    if (departureTime) departureTime.textContent = to12HourFormat(currentTransport.departureTime);
    if (arrivalTime) arrivalTime.textContent = to12HourFormat(currentTransport.arrivalTime);
    if (fare) fare.textContent = `₹${currentTransport.fare}`;
    if (availableSeats) availableSeats.textContent = `${currentTransport.availableSeats} / ${currentTransport.capacity}`;

    const duration = currentTransport.duration || '90';
    const stops = getRouteStops().length || 2;

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
    if (!currentTransport) return;

    const stopsList = document.getElementById('stopsList');
    if (!stopsList) return;

    const routeStops = getRouteStops();
    if (routeStops.length === 0) {
        stopsList.innerHTML = '<p style="margin-top: 8px; color: #666;">No stop data available.</p>';
        return;
    }

    const isGeneratedStops = !Array.isArray(currentTransport.schedule) || currentTransport.schedule.length === 0;

    const stopsHtml = routeStops
        .map((stop, index) => {
            const arrivalTime = stop.arrivalTime ? to12HourFormat(stop.arrivalTime) : '';
            const departureTime = stop.departureTime ? to12HourFormat(stop.departureTime) : '';
            const showDeparture = departureTime && departureTime !== arrivalTime;

            return `
            <div class="stop-item">
                <div class="stop-number">${index + 1}</div>
                <div class="stop-info">
                    <h4>${stop.stopName}</h4>
                    <div class="stop-time">
                        ${arrivalTime ? `Arrive: ${arrivalTime}` : ''}
                        ${showDeparture ? `<br/>Depart: ${departureTime}` : ''}
                    </div>
                </div>
            </div>
        `;
        })
        .join('');

    stopsList.innerHTML = stopsHtml;
}

function initializeMap() {
    const mapEl = document.getElementById('routeMap');
    if (!mapEl) return;

    const mapPoints = getMapPoints();
    if (mapPoints.length < 2) {
        mapEl.innerHTML = '<p style="padding:20px;">No map data</p>';
        return;
    }

    if (routeMap) {
        routeMap.remove();
        routeMap = null;
    }

    mapEl.innerHTML = '';

    // create Leaflet map
    const first = mapPoints[0];
    const last = mapPoints[mapPoints.length - 1];
    const centerLat = (parseFloat(first.lat) + parseFloat(last.lat)) / 2;
    const centerLng = (parseFloat(first.lng) + parseFloat(last.lng)) / 2;

    routeMap = L.map(mapEl).setView([centerLat, centerLng], 8);

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(routeMap);

    // build polyline and markers
    const latlngs = [];
    mapPoints.forEach((stop) => {
        const lat = parseFloat(stop.lat);
        const lng = parseFloat(stop.lng);
        const arrivalTime = stop.arrivalTime ? to12HourFormat(stop.arrivalTime) : '';
        const departureTime = stop.departureTime ? to12HourFormat(stop.departureTime) : '';
        latlngs.push([lat, lng]);

        const marker = L.marker([lat, lng]).addTo(routeMap);
        marker.bindPopup(
            `<strong>${stop.stopName}</strong><br>` +
            (arrivalTime ? `Arr: ${arrivalTime}<br>` : '') +
            (departureTime && departureTime !== arrivalTime ? `Dep: ${departureTime}` : '')
        );
    });

    L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(routeMap);

    // fit view to route
    const bounds = L.latLngBounds(latlngs);
    routeMap.fitBounds(bounds, { padding: [50, 50] });
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
    Departure: ${to12HourFormat(currentTransport.departureTime)}
    Arrival: ${to12HourFormat(currentTransport.arrivalTime)}
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