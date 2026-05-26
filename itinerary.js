// Load saved itineraries on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadItineraries();
    setupSearch();
});

async function loadItineraries() {
    const itineraryGrid = document.getElementById('itineraryGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');

    try {
        // Get user data
        const userRes = await fetch('/api/me', {
            credentials: 'include'
        });

        if (!userRes.ok) {
            if (userRes.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to get user data');
        }

        const userData = await userRes.json();

        if (userData.success === false) {
            window.location.href = '/login';
            return;
        }

        const userId = userData.uid;

        // Fetch saved itineraries (using POST as per server.js line 919)
        const itinerariesRes = await fetch(`/api/getItineraries/${userId}/`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!itinerariesRes.ok) {
            throw new Error('Failed to fetch itineraries');
        }

        const result = await itinerariesRes.json();
        const itineraries = result.itineraries || [];

        // Check if empty
        if (itineraries.length === 0) {
            emptyState.style.display = 'flex';
            itineraryGrid.style.display = 'none';
            noResults.style.display = 'none';
            return;
        }

        // Display itineraries
        emptyState.style.display = 'none';
        itineraryGrid.style.display = 'grid';
        itineraryGrid.innerHTML = '';

        itineraries.forEach(item => {
            // console.log(item);
            const card = createItineraryCard(item);
            itineraryGrid.appendChild(card);
        });

    } catch (err) {
        console.error('Load itineraries error:', err);
        showToast('Failed to load itineraries', '#ef4444');
    }
}

function createItineraryCard(item) {
    const card = document.createElement('div');

    const locationName = item.name || 'Unknown Location';
    const duration = item.duration || 'No Duration';
    const itineraryPlan = item.content || '';
    const createdAt = item.rawDate || new Date();

    card.className = 'itinerary-card';

    card.dataset.location = locationName.toLowerCase();
    card.dataset.duration = duration.toLowerCase();

    // Format date
    const date = new Date(createdAt);

    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Remove HTML tags for preview text
    const plainText = itineraryPlan.replace(/<[^>]*>/g, '');

    // Truncate preview
    const previewText =
        plainText.length > 200
            ? plainText.substring(0, 200) + '...'
            : plainText;

    card.innerHTML = `
        <div class="card-top">
            <div class="card-top-left">
                <h3>${locationName}</h3>
                <span class="duration-badge">${duration}</span>
            </div>

            <div class="card-date">${formattedDate}</div>
        </div>

        <div class="card-body-text">${previewText}</div>

        <div class="card-actions">
            <button class="btn-view" onclick="viewItinerary('${item.itineraryId}')">
                <i class="fa-solid fa-eye"></i> View Full
            </button>

            <button class="btn-delete" onclick="deleteItinerary('${item.itineraryId}', '${locationName}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

async function viewItinerary(itineraryId) {
    try {
        const userRes = await fetch('/api/me', {
            credentials: 'include'
        });

        if (!userRes.ok) {
            window.location.href = '/login';
            return;
        }

        const userData = await userRes.json();
        const userId = userData.uid;

        // Fetch itineraries
        const res = await fetch(`/api/getItineraries/${userId}/`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch itineraries');
        }

        const result = await res.json();

        const itineraries = result.itineraries || [];

        const itinerary = itineraries.find(
            item => String(item.itineraryId) === String(itineraryId)
        );

        if (!itinerary) {
            showToast('Itinerary not found', '#ef4444');
            return;
        }

        // Populate modal
        document.getElementById('modalTitle').innerText = itinerary.name;
        document.getElementById('modalDuration').innerText = itinerary.duration;
        document.getElementById('modalBody').innerHTML = itinerary.content;

        // Show modal
        document.getElementById('modalOverlay').classList.add('open');

    } catch (err) {
        console.error('View itinerary error:', err);
        showToast('Failed to load itinerary', '#ef4444');
    }
}

async function deleteItinerary(itineraryId, locationName) {
    if (!confirm(`Delete ${locationName} itinerary?`)) {
        return;
    }

    try {
        const userRes = await fetch('/api/me', {
            credentials: 'include'
        });

        if (!userRes.ok) {
            window.location.href = '/login';
            return;
        }

        const userData = await userRes.json();
        const userId = userData.uid;

        // Delete from database
        const deleteRes = await fetch(`/api/deleteItinerary/${userId}/${itineraryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!deleteRes.ok) {
            throw new Error('Failed to delete itinerary');
        }

        showToast('Itinerary deleted', '#22c55e');

        // Reload itineraries
        await loadItineraries();

    } catch (err) {
        console.error('Delete itinerary error:', err);
        showToast('Failed to delete itinerary', '#ef4444');
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

// Close modal when clicking outside
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
        closeModal();
    }
});

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const itineraryGrid = document.getElementById('itineraryGrid');
    const noResults = document.getElementById('noResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = itineraryGrid.querySelectorAll('.itinerary-card');

        let visibleCount = 0;

        cards.forEach(card => {
            const location = card.dataset.location;
            const duration = card.dataset.duration;

            if (location.includes(query) || duration.includes(query)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show "no results" message if nothing matches
        if (visibleCount === 0 && cards.length > 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    });
}

function showToast(message, color) {
    let toast = document.getElementById('itinerary-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'itinerary-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 20px;
            border-radius: 10px;
            font-family: 'Press Start 2P', monospace;
            font-size: 9px;
            color: white;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.style.background = color;
    toast.style.opacity = '1';

    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}