// app.js - Home page search functionality
let currentResults = [];
let currentSort = 'fare';

// List of available cities
const AVAILABLE_CITIES = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul',
    'Thanjavur', 'Kumbakonam', 'Cuddalore', 'Nagercoil', 'Kanyakumari',
    'Tirupur', 'Karur', 'Namakkal', 'Pudukkottai', 'Sivaganga',
    'Virudhunagar', 'Ramanathapuram', 'Tenkasi', 'Tiruvannamalai', 'Villupuram',
    'Kallakurichi', 'Ranipet', 'Chengalpattu', 'Kanchipuram', 'Thiruvallur',
    'Ariyalur', 'Perambalur', 'Nagapattinam', 'Mayiladuthurai', 'Karaikudi',
    'Sivakasi', 'Kovilpatti', 'Sankarankovil', 'Srirangam', 'Manapparai',
    'Pollachi', 'Palani', 'Oddanchatram', 'Batlagundu', 'Paramakudi',
    'Mudukulathur', 'Tiruvottiyur', 'Ambattur', 'Avadi', 'Bangalore',
    'Kochi', 'Thiruvananthapuram', 'Hyderabad', 'Mysuru'
];

function parseTimeToMinutes(timeValue) {
    if (timeValue === null || timeValue === undefined || timeValue === '') return null;

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

function to12HourFormat(timeValue) {
    const minutes = parseTimeToMinutes(timeValue);
    if (minutes === null) return timeValue || '-';

    const normalized = ((minutes % 1440) + 1440) % 1440;
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const meridiem = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;

    return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

function formatDuration(durationMinutes) {
    const totalMinutes = Math.max(0, Math.round(Number(durationMinutes) || 0));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUserGreeting();
    setupEventListeners();
    setTodayAsDefault();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const sourceInput = document.getElementById('source');
    const destInput = document.getElementById('destination');
    const logoutBtn = document.getElementById('logoutBtn');
    const sortBtns = document.querySelectorAll('.sort-btn');

    searchBtn.addEventListener('click', performSearch);
    sourceInput.addEventListener('input', (e) => handleAutocomplete(e, 'sourceSuggestions'));
    sourceInput.addEventListener('focus', (e) => handleAutocomplete(e, 'sourceSuggestions'));
    destInput.addEventListener('input', (e) => handleAutocomplete(e, 'destSuggestions'));
    destInput.addEventListener('focus', (e) => handleAutocomplete(e, 'destSuggestions'));
    logoutBtn.addEventListener('click', logout);
    sortBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sortBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSort = e.target.dataset.sort;
            displayResults(currentResults);
        });
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        const suggestions = document.querySelectorAll('.suggestions-list');
        suggestions.forEach(list => {
            if (!list.closest('.autocomplete-wrapper') || !list.closest('.autocomplete-wrapper').contains(e.target)) {
                list.classList.remove('active');
            }
        });
    });
}

function setTodayAsDefault() {
    const dateInput = document.getElementById('journeyDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function displayUserGreeting() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const greeting = document.getElementById('userGreeting');
        greeting.textContent = `Welcome, ${user.name}!`;
    }
}

async function handleAutocomplete(e, suggestionListId) {
    const input = e.target.value.trim();
    const suggestionList = document.getElementById(suggestionListId);

    if (input.length === 0) {
        // Show all cities when focus is on empty input
        const suggestions = AVAILABLE_CITIES;
        displaySuggestions(suggestionList, suggestions, suggestionListId);
        return;
    }

    if (input.length < 1) {
        suggestionList.classList.remove('active');
        return;
    }

    // Filter cities based on input
    const suggestions = getLocationSuggestions(input);

    if (suggestions.length === 0) {
        suggestionList.classList.remove('active');
        return;
    }

    displaySuggestions(suggestionList, suggestions, suggestionListId);
}

function displaySuggestions(suggestionList, suggestions, suggestionListId) {
    suggestionList.innerHTML = suggestions
        .slice(0, 60) // Show up to 60 suggestions
        .map(city => `<li data-city="${city}">${city}</li>`)
        .join('');
    suggestionList.classList.add('active');

    // Add click handlers
    suggestionList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const city = item.getAttribute('data-city');
            if (suggestionListId === 'sourceSuggestions') {
                document.getElementById('source').value = city;
            } else {
                document.getElementById('destination').value = city;
            }
            suggestionList.classList.remove('active');
        });
    });
}

function getLocationSuggestions(input) {
    const searchTerm = input.toLowerCase();
    return AVAILABLE_CITIES.filter(city => 
        city.toLowerCase().includes(searchTerm) ||
        city.toLowerCase().startsWith(searchTerm)
    );
}

async function performSearch() {
    const source = document.getElementById('source').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const transportType = document.getElementById('transportType').value;
    const errorDiv = document.getElementById('errorMessage');
    const loadingDiv = document.getElementById('loadingIndicator');

    // Validation
    if (!source || !destination) {
        errorDiv.textContent = 'Please enter both source and destination';
        errorDiv.style.display = 'block';
        return;
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
        errorDiv.textContent = 'Source and destination cannot be the same';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        errorDiv.style.display = 'none';
        loadingDiv.style.display = 'flex';

        console.log('Searching for:', { source, destination, transportType });

        const response = await apiCall(
            `${ROUTE_ENDPOINTS.SEARCH}?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&type=${transportType}`,
            { method: 'GET' }
        );

        console.log('Search response:', response);

        const normalizedResults = Array.isArray(response.data)
            ? response.data
            : (response.data && Array.isArray(response.data.data) ? response.data.data : []);

        currentResults = normalizedResults;
        displayResults(currentResults);

    } catch (error) {
        console.error('Search error:', error);
        errorDiv.textContent = error.message || 'Error searching routes';
        errorDiv.style.display = 'block';
        currentResults = [];
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorDiv = document.getElementById('errorMessage');

    if (results.length === 0) {
        errorDiv.textContent = 'No routes found for this source and destination. Please choose cities from the suggestions list and try again.';
        errorDiv.style.display = 'block';
        resultsSection.style.display = 'none';
        return;
    }

    errorDiv.style.display = 'none';
    resultsSection.style.display = 'block';

    // Sort results
    const sortedResults = sortResults(results);

    if (sortedResults.length === 0) {
        errorDiv.textContent = 'No valid route data available for display.';
        errorDiv.style.display = 'block';
        resultsSection.style.display = 'none';
        return;
    }

    const cardsHtml = sortedResults
        .map(route => createRouteCard(route))
        .filter(Boolean)
        .join('');

    if (!cardsHtml.trim()) {
        resultsContainer.innerHTML = renderFallbackResults(sortedResults);
        return;
    }

    resultsContainer.innerHTML = cardsHtml;

    // Add event listeners to route cards
    document.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', () => {
            const transportId = card.dataset.transportId;
            window.location.href = `route-details.html?id=${transportId}`;
        });

        const viewBtn = card.querySelector('.view-details-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const transportId = card.dataset.transportId;
                window.location.href = `route-details.html?id=${transportId}`;
            });
        }
    });
}

function renderFallbackResults(results) {
    const rows = (Array.isArray(results) ? results : [])
        .map((route) => {
            if (!route) return '';

            const type = route.transportType || '-';
            const number = route.number || '-';
            const departure = to12HourFormat(route.departureTime);
            const arrival = to12HourFormat(route.arrivalTime);
            const fare = Number(route.fare) || 0;
            const duration = Number(route.duration) || 0;
            const durationLabel = formatDuration(duration);

            return `
                <div class="route-card" style="border-left-width: 3px;">
                    <div class="route-card-title">${route.name || 'Transport Service'} (${number})</div>
                    <div class="route-card-info">
                        <div class="info-item"><span class="info-label">Type</span><span class="info-value">${type}</span></div>
                        <div class="info-item"><span class="info-label">Fare</span><span class="info-value fare-value">₹${fare}</span></div>
                    </div>
                    <div class="route-card-info">
                        <div class="info-item"><span class="info-label">Departure</span><span class="info-value">${departure}</span></div>
                        <div class="info-item"><span class="info-label">Arrival</span><span class="info-value">${arrival}</span></div>
                    </div>
                    <div class="availability">Duration: ${durationLabel}</div>
                </div>
            `;
        })
        .filter(Boolean)
        .join('');

    if (!rows.trim()) {
        return '<div class="error-message" style="display:block;">No valid route rows to show.</div>';
    }

    return rows;
}

function sortResults(results) {
    const sorted = (Array.isArray(results) ? results : []).filter(route => route && typeof route === 'object');

    switch (currentSort) {
        case 'fare':
            sorted.sort((a, b) => (Number(a.fare) || Number.MAX_SAFE_INTEGER) - (Number(b.fare) || Number.MAX_SAFE_INTEGER));
            break;
        case 'duration':
            sorted.sort((a, b) => (Number(a.duration) || Number.MAX_SAFE_INTEGER) - (Number(b.duration) || Number.MAX_SAFE_INTEGER));
            break;
        case 'departure':
            sorted.sort((a, b) => {
                const aDeparture = parseTimeToMinutes(a.departureTime);
                const bDeparture = parseTimeToMinutes(b.departureTime);

                if (aDeparture === null && bDeparture === null) return 0;
                if (aDeparture === null) return 1;
                if (bDeparture === null) return -1;
                return aDeparture - bDeparture;
            });
            break;
    }

    return sorted;
}

function createRouteCard(transport) {
    if (!transport || typeof transport !== 'object') return '';

    const typeClass = transport.transportType || 'bus';
    const availableSeats = Number(transport.availableSeats) || 0;
    const capacity = Number(transport.capacity) || 0;
    const availability = availableSeats > 0 ? 'high' : 'low';
    const availabilityText = availableSeats > 5 ? 'Plenty of seats' :
                           availableSeats > 0 ? 'Limited seats' : 'Full';
    const departureTime = to12HourFormat(transport.departureTime);
    const arrivalTime = to12HourFormat(transport.arrivalTime);
    const duration = Number(transport.duration) || 0;
    const durationLabel = formatDuration(duration);
    const fare = Number(transport.fare) || 0;
    const transportName = transport.name || 'Transport Service';
    const transportNumber = transport.number || '-';
    const transportId = transport._id || '';

    return `
        <div class="route-card ${typeClass}" data-transport-id="${transportId}">
            <div class="route-card-header">
                <div class="route-card-title">${transportName} (${transportNumber})</div>
                <span class="badge ${typeClass}">${typeClass}</span>
            </div>

            <div class="route-card-info">
                <div class="info-item">
                    <span class="info-label">Departure</span>
                    <span class="info-value">${departureTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Arrival</span>
                    <span class="info-value">${arrivalTime}</span>
                </div>
            </div>

            <div class="route-card-info">
                <div class="info-item">
                    <span class="info-label">Duration</span>
                    <span class="info-value">${durationLabel}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fare</span>
                    <span class="info-value fare-value">₹${fare}</span>
                </div>
            </div>

            <div class="availability ${availability}">
                ${availableSeats} / ${capacity} seats available • ${availabilityText}
            </div>

            <div class="route-card-footer">
                <button class="btn btn-primary view-details-btn" style="flex: 1; cursor: pointer;">View Details</button>
                <button class="btn btn-secondary favorite-btn" onclick="addToFavoritesQuick(event, '${transportId}', '${transportNumber}')" style="cursor: pointer;">♡</button>
            </div>
        </div>
    `;
}

async function addToFavoritesQuick(e, transportId, transportNumber) {
    e.stopPropagation();

    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    try {
        await apiCall(FAVORITE_ENDPOINTS.CREATE, {
            method: 'POST',
            body: JSON.stringify({
                source,
                destination,
                transportId
            })
        });

        alert(`${transportNumber} added to favorites!`);
    } catch (error) {
        alert('Failed to add to favorites: ' + error.message);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}