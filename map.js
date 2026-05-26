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

    exploreLocation(name);
});

// --- ITINERARY SIDEBAR LOGIC ---

// 1. Open Itinerary
document.getElementById('generateItineraryBtn').addEventListener('click', async function() {
    const name = document.getElementById('cardTitle').innerText;
    const duration = document.getElementById('durationSelect').value;

    // Trigger the slide-in transition
    wrapper.classList.add('itinerary-active');

    // Show loading state
    const content = document.getElementById('itineraryContent');
    content.innerHTML = `
        <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2346b8;">
            <h4 style="margin:0; color:#333;">${name} Trip Plan</h4>
            <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${duration}</p>
        </div>
        <div style="margin-top: 20px; text-align: center; padding: 40px 20px;">
            <p style="font-size: 16px; color: #666;">🤖 Generating your personalized itinerary...</p>
        </div>
    `;

    // Hide save button while loading
    const saveBtn = document.getElementById('saveItineraryBtn');
    if (saveBtn) saveBtn.style.display = 'none';

    // Pan map to the left so the marker isn't covered by the floating panels
    map.panBy([250, 0], { animate: true });

    // Fetch AI-generated itinerary
    try {
        const res = await fetch('/promptItinerary', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `create a ${duration} travel plan for ${name}, only the itinerary with detailed morning, lunch, afternoon, and evening activities`
            })
        });

        const api = await res.json();

        // Update content with AI response
        content.innerHTML = `
            <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2346b8;">
                <h4 style="margin:0; color:#333;">${name} Trip Plan</h4>
                <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${duration}</p>
            </div>
            <div style="margin-top: 20px; line-height: 1.6; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${api.reply}
            </div>
        `;

        // Store generated content for saving
        content.dataset.name = name;
        content.dataset.duration = duration;
        content.dataset.reply = api.reply;

        // Show save button
        if (saveBtn) saveBtn.style.display = 'block';

    } catch (err) {
        console.error("generate error", err);
        content.innerHTML = `
            <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #2346b8;">
                <h4 style="margin:0; color:#333;">${name} Trip Plan</h4>
                <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${duration}</p>
            </div>
            <div style="margin-top: 20px; padding: 20px; background: #ffebee; border-radius: 8px; text-align: center;">
                <p style="color: #c62828; margin: 0;">❌ Failed to generate itinerary.</p>
                <p style="color: #666; font-size: 14px; margin: 10px 0 0;">Please try again later.</p>
            </div>
        `;
    }
});

// --- SAVE TO FAVORITES LOGIC ---
document.getElementById('saveItineraryBtn').addEventListener('click', function() {
    const content = document.getElementById('itineraryContent');
    const name = content.dataset.name;
    const duration = content.dataset.duration;
    const reply = content.dataset.reply;

    if (!name || !reply) return;

    const saved = JSON.parse(localStorage.getItem('sugbohenyo_itineraries') || '[]');

    // Check for duplicates
    const exists = saved.some(item => item.name === name && item.duration === duration && item.content === reply);
    if (exists) {
        showToast('Already saved!', '#f59e0b');
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

    saved.unshift({ name, duration, content: reply, date });
    localStorage.setItem('sugbohenyo_itineraries', JSON.stringify(saved));

    showToast('Saved to your itineraries! ✅', '#22c55e');

    // Update button state
    this.innerText = '✅ Saved!';
    this.disabled = true;
    this.style.opacity = '0.6';

    // Show the view itineraries link
    const viewLink = document.getElementById('viewItinerariesLink');
    if (viewLink) viewLink.style.display = 'block';
});

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

// Close Itinerary Function
function closeItinerary() {
    wrapper.classList.remove('itinerary-active');

    // Reset save button
    const saveBtn = document.getElementById('saveItineraryBtn');
    if (saveBtn) {
        saveBtn.innerText = '🔖 Save to Favorites';
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        saveBtn.style.display = 'none';
    }

    // Hide view link
    const viewLink = document.getElementById('viewItinerariesLink');
    if (viewLink) viewLink.style.display = 'none';

    // Pan map back to center
    map.panBy([-250, 0], { animate: true });
}

document.getElementById('zoom-in').onclick = function() {
    map.zoomIn();
};

document.getElementById('zoom-out').onclick = function() {
    map.zoomOut();
};

async function exploreLocation(locationName) {
    try {
        // Validate location name
        if (!locationName || locationName === 'Municipality') {
            console.error('Invalid location name');
            return;
        }
 
        // Get user data first
        const userRes = await fetch('/api/me', {
            credentials: 'include'
        });
 
        if (!userRes.ok) {
            if (userRes.status === 401) {
                console.warn('User not authenticated, redirecting to login');
                window.location.href = '/login';
                return;
            }
            throw new Error(`Failed to get user data: ${userRes.status}`);
        }
 
        const userData = await userRes.json();
 
        if (userData.success === false) {
            console.warn('User authentication failed, redirecting to login');
            window.location.href = '/login';
            return;
        }
 
        const userId = userData.uid;
 
        // Call the explore endpoint
        const exploreRes = await fetch(`/api/locationExplore/${userId}/${encodeURIComponent(locationName)}`, {
            method: 'POST',
            credentials: 'include'
        });
 
        const result = await exploreRes.json();
 
        // Handle different status codes
        if (!exploreRes.ok) {
            if (exploreRes.status === 403) {
                console.error('Forbidden: Cannot update another user\'s progress');
            } else if (exploreRes.status === 404) {
                console.error('Location not found in database:', locationName);
            } else if (exploreRes.status === 500) {
                console.error('Server error while exploring location');
            } else {
                console.error('Failed to explore location:', result.message);
            }
            return;
        }
 
        // Success - log silently
        console.log(`✓ ${locationName} marked as explored`, result);
 
    } catch (error) {
        console.error('exploreLocation error:', error);
    }
}