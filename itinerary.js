let currentSearch = '';
let currentModalIndex = -1;

function loadItineraries() {
    const grid = document.getElementById('itineraryGrid');
    const empty = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    const saved = JSON.parse(localStorage.getItem('sugbohenyo_itineraries') || '[]');

    grid.innerHTML = '';

    if (saved.length === 0) {
        empty.style.display = 'flex';
        noResults.style.display = 'none';
        return;
    }

    empty.style.display = 'none';

    saved.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'itinerary-card';
        card.dataset.name = item.name.toLowerCase();
        card.dataset.duration = item.duration;

        card.innerHTML = `
            <div class="card-top">
                <div class="card-top-left">
                    <h3>${item.name}</h3>
                    <span class="duration-badge">${item.duration}</span>
                </div>
                <span class="card-date">${item.date}</span>
            </div>
            <div class="card-body-text">${item.content}</div>
            <div class="card-actions">
                <button class="btn-view" onclick="viewItinerary(${index})">
                    <i class="fa-solid fa-eye"></i> View Full
                </button>
                <button class="btn-delete" onclick="deleteItinerary(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    applyFilters();
}

function applyFilters() {
    const cards = document.querySelectorAll('.itinerary-card');
    const noResults = document.getElementById('noResults');
    let visible = 0;

    cards.forEach(card => {
        const nameMatch = card.dataset.name.includes(currentSearch);

        if (nameMatch) {
            card.classList.remove('hidden');
            visible++;
        } else {
            card.classList.add('hidden');
        }
    });

    noResults.style.display = visible === 0 && cards.length > 0 ? 'block' : 'none';
}

// Search
document.getElementById('searchInput').addEventListener('input', function() {
    currentSearch = this.value.toLowerCase();
    applyFilters();
});

function viewItinerary(index) {
    const saved = JSON.parse(localStorage.getItem('sugbohenyo_itineraries') || '[]');
    const item = saved[index];
    currentModalIndex = index;
    document.getElementById('modalTitle').innerText = item.name + ' Trip Plan';
    document.getElementById('modalDuration').innerText = item.duration;
    document.getElementById('modalBody').innerHTML = item.content;
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    currentModalIndex = -1;
}

function deleteItinerary(index) {
    const saved = JSON.parse(localStorage.getItem('sugbohenyo_itineraries') || '[]');
    saved.splice(index, 1);
    localStorage.setItem('sugbohenyo_itineraries', JSON.stringify(saved));
    loadItineraries();
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

loadItineraries();
