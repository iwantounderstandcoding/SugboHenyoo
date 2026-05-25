// 1. Initial Map Settings
const CEBU_CENTER = [10.4, 123.85];
const DEFAULT_ZOOM = 10;
const CITY_ZOOM = 15;

const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView(CEBU_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const citySelector = document.getElementById('citySelector');
const infoCard = document.getElementById('infoCard');
const wrapper = document.querySelector('.map-wrapper');
let currentMarker = null;

// --- CITY SELECTION LOGIC ---
citySelector.addEventListener('change', function () {
    const val = this.value;

    // AUTO-CLOSE ITINERARY: Hide sidebar immediately when a new city is picked
    wrapper.classList.remove('itinerary-active');

    // --- 1. RESET CASE (Hides card when no city is picked) ---
    if (!val || val.trim() === "") {
        infoCard.style.display = 'none';
        
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
        }

        map.flyTo(CEBU_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1 });
        return; 
    }

    // --- 2. SELECTION CASE ---
    const coords = val.split(',').map(Number);
    const selected = this.options[this.selectedIndex];

    const name = selected.getAttribute('data-name');
    const tagline = selected.getAttribute('data-tagline');
    const history = selected.getAttribute('data-history');
    const items = selected.getAttribute('data-items').split(',');
    const imgSrc = selected.getAttribute('data-img');
    const videoUrl = selected.getAttribute('data-video');

    // Show Card UI
    infoCard.style.display = 'block';

    // Update Text Content
    document.getElementById('cardTitle').innerText = name;
    document.getElementById('cardTagline').innerText = tagline;
    document.getElementById('cardHistory').innerText = history;
    document.getElementById('videoLink').href = videoUrl;
    
    // Dynamic Explore Title
    document.getElementById('exploreTitle').innerText = `Do you wanna explore ${name}?`;

    // Update Image
    document.getElementById('cardMedia').innerHTML = `
        <img src="${imgSrc}" alt="${name}" style="width:100%; height:300px; object-fit:cover; display:block;">
    `;

    // Update Tags
    const tagsDiv = document.getElementById('cardTags');
    tagsDiv.innerHTML = ''; 
    items.forEach(item => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = item;
        tagsDiv.appendChild(span);
    });

    // --- 3. MARKER & CAMERA LOGIC ---
    if (currentMarker) map.removeLayer(currentMarker);

    const uprightIcon = L.divIcon({
        html: `
            <div class="marker-center-stack">
                <div class="custom-upright-label">${name}</div>
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" class="upright-img">
            </div>
        `,
        iconSize: [0, 0],
        className: 'upright-marker-container'
    });

    currentMarker = L.marker(coords, { icon: uprightIcon }).addTo(map);
    map.flyTo(coords, CITY_ZOOM, { animate: true, duration: 1.5 });
});

// --- ITINERARY SIDEBAR LOGIC ---

// 1. Open Itinerary
document.getElementById('generateItineraryBtn').addEventListener('click', function() {
    const name = document.getElementById('cardTitle').innerText;
    const duration = document.getElementById('durationSelect').value;

    // Trigger the slide-in transition
    wrapper.classList.add('itinerary-active');

    // Populate Sidebar Content dynamically based on the current card
    const content = document.getElementById('itineraryContent');
    content.innerHTML = `
        <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2346b8;">
            <h4 style="margin:0; color:#333;">${name} Trip Plan</h4>
            <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${duration}</p>
        </div>
        <div style="margin-top: 20px; line-height: 1.6;">
            <p>🌅 <strong>Morning:</strong> Start your journey at the heart of ${name}. Visit local heritage sites and grab a quick native breakfast.</p>
            <p>🍴 <strong>Lunch:</strong> Taste the famous delicacies of ${name} at a recommended local restaurant.</p>
            <p>🏖️ <strong>Afternoon:</strong> Head to the natural attractions. Check the "Famous For" tags in your info card for the best spots!</p>
            <p>✨ <strong>Evening:</strong> Relax by the coast or mountain view decks before heading back.</p>
        </div>
    `;

    // Pan map to the left so the marker isn't covered by the floating panels
    map.panBy([250, 0], { animate: true });
});

// 2. Close Itinerary Function
function closeItinerary() {
    wrapper.classList.remove('itinerary-active');
    // Pan map back to center
    map.panBy([-250, 0], { animate: true });
}

document.getElementById('zoom-in').onclick = function() {
    map.zoomIn();
};

document.getElementById('zoom-out').onclick = function() {
    map.zoomOut();
};