// app.js - Home page search functionality
let currentResults = [];
let currentSort = 'fare';

// List of available cities
const AVAILABLE_CITIES = [
  'Coimbatore', 'Erode', 'Salem', 'Bangalore', 'Chennai',
  'Tiruchirappalli', 'Kochi', 'Thiruvananthapuram', 'Hyderabad', 'Pune',
  'Mumbai', 'Delhi', 'Jaipur', 'Lucknow', 'Kolkata',
  'Patna', 'Guwahati', 'Chandigarh', 'Ahmedabad', 'Surat',
  'Vadodara', 'Nagpur', 'Indore', 'Bhopal', 'Raipur'
];

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
    dateInput.min = today;
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
        .slice(0, 10) // Show max 10 suggestions
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
    const journeyDate = document.getElementById('journeyDate').value;
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
            `${ROUTE_ENDPOINTS.SEARCH}?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&type=${transportType}&date=${journeyDate}`,
            { method: 'GET' }
        );

        console.log('Search response:', response);

        currentResults = response.data || [];
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
        errorDiv.textContent = 'No routes found. Try different locations or dates.';
        errorDiv.style.display = 'block';
        resultsSection.style.display = 'none';
        return;
    }

    errorDiv.style.display = 'none';
    resultsSection.style.display = 'block';

    // Sort results
    const sortedResults = sortResults(results);

    resultsContainer.innerHTML = sortedResults
        .map(route => createRouteCard(route))
        .join('');

    // Add event listeners to route cards
    document.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', () => {
            const transportId = card.dataset.transportId;
            window.location.href = `route-details.html?id=${transportId}`;
        });
        
        // Prevent card click when clicking buttons
        const buttons = card.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    });
}

function sortResults(results) {
    const sorted = [...results];

    switch (currentSort) {
        case 'fare':
            sorted.sort((a, b) => a.fare - b.fare);
            break;
        case 'duration':
            sorted.sort((a, b) => a.duration - b.duration);
            break;
        case 'departure':
            sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
            break;
    }

    return sorted;
}

function createRouteCard(transport) {
    const typeClass = transport.transportType;
    const availability = transport.availableSeats > 0 ? 'high' : 'low';
    const availabilityText = transport.availableSeats > 5 ? 'Plenty of seats' : 
                           transport.availableSeats > 0 ? 'Limited seats' : 'Full';

    return `
        <div class="route-card ${typeClass}" data-transport-id="${transport._id}">
            <div class="route-card-header">
                <div class="route-card-title">${transport.name} (${transport.number})</div>
                <span class="badge ${typeClass}">${transport.transportType}</span>
            </div>

            <div class="route-card-info">
                <div class="info-item">
                    <span class="info-label">Departure</span>
                    <span class="info-value">${transport.departureTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Arrival</span>
                    <span class="info-value">${transport.arrivalTime}</span>
                </div>
            </div>

            <div class="route-card-info">
                <div class="info-item">
                    <span class="info-label">Duration</span>
                    <span class="info-value">${transport.duration} min</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fare</span>
                    <span class="info-value fare-value">₹${transport.fare}</span>
                </div>
            </div>

            <div class="availability ${availability}">
                ${transport.availableSeats} seats available • ${availabilityText}
            </div>

            <div class="route-card-footer">
                <button class="btn btn-primary" style="flex: 1; cursor: pointer;">View Details</button>
                <button class="btn btn-secondary" onclick="addToFavoritesQuick(event, '${transport._id}', '${transport.number}')" style="cursor: pointer;">♡</button>
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