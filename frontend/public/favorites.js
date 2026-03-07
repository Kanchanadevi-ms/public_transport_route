// favorites.js - Favorites page functionality
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUserGreeting();
    loadFavorites();
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', logout);
}

function displayUserGreeting() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const greeting = document.getElementById('userGreeting');
        greeting.textContent = `Welcome, ${user.name}!`;
    }
}

async function loadFavorites() {
    try {
        const loadingDiv = document.getElementById('loadingIndicator');
        const emptyState = document.getElementById('emptyState');
        const favContainer = document.getElementById('favoritesContainer');
        const errorDiv = document.getElementById('errorMessage');

        loadingDiv.style.display = 'flex';
        errorDiv.style.display = 'none';

        const response = await apiCall(FAVORITE_ENDPOINTS.GET_ALL);
        const favorites = response.data;

        loadingDiv.style.display = 'none';

        if (favorites.length === 0) {
            emptyState.style.display = 'block';
            favContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            favContainer.style.display = 'grid';
            displayFavorites(favorites);
        }
    } catch (error) {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

function displayFavorites(favorites) {
    const container = document.getElementById('favoritesContainer');

    container.innerHTML = favorites.map(fav => `
        <div class="favorite-card">
            <div class="favorite-card-title">
                ${fav.source} → ${fav.destination}
            </div>
            <div class="favorite-card-details">
                ${fav.transportDetails ? `
                    <div><strong>${fav.transportDetails.name}</strong> (#${fav.transportDetails.number})</div>
                    <div>${fav.transportDetails.transportType.toUpperCase()} | ₹${fav.transportDetails.fare}</div>
                ` : '<div>Route details</div>'}
                <div style="font-size: 12px; color: #999; margin-top: 5px;">
                    Saved on ${new Date(fav.savedAt).toLocaleDateString()}
                </div>
            </div>
            <div class="favorite-card-actions">
                <button class="btn btn-primary" onclick="quickSearch('${fav.source}', '${fav.destination}')">Search Again</button>
                <button class="btn btn-secondary" onclick="removeFavorite('${fav._id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function quickSearch(source, destination) {
    // Redirect to search page with source and destination filled
    const params = new URLSearchParams({
        source,
        destination
    });
    window.location.href = `index.html?${params.toString()}`;
}

async function removeFavorite(favoriteId) {
    if (!confirm('Are you sure you want to remove this favorite?')) {
        return;
    }

    try {
        await apiCall(FAVORITE_ENDPOINTS.DELETE(favoriteId), {
            method: 'DELETE'
        });

        alert('Favorite removed');
        loadFavorites();
    } catch (error) {
        alert('Failed to remove favorite: ' + error.message);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}