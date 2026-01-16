let map;
let markers = [];
let markerObjects = {};
let userLocationMarker = null;
let selectedPurpose = '';
let filters = {
    wifi: false,
    ac: false,
    sockets: false
};

// Check if cafesData is loaded
function checkDataLoaded() {
    if (typeof cafesData === 'undefined') {
        console.error('ERROR: cafesData is not defined. Make sure data.js is loaded before script.js');
        alert('Error: Cafe data not loaded. Please check that data.js exists and is loaded correctly.');
        return false;
    }
    console.log('Cafes loaded:', cafesData.length);
    return true;
}

// Initialize map with geolocation
function initMap() {
    // Check if data is loaded first
    if (!checkDataLoaded()) {
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("Location detected:", pos);
                createMap(pos);
            },
            (error) => {
                console.log("Location detection failed, using default location");
                // Center of India as default
                const defaultPos = { lat: 20.5937, lng: 78.9629 };
                createMap(defaultPos);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        console.log("Geolocation not supported");
        const defaultPos = { lat: 20.5937, lng: 78.9629 };
        createMap(defaultPos);
    }
}

function createMap(center) {
    console.log("Creating map at:", center);
    
    // Initialize Leaflet map
    map = L.map('map', {
        center: [center.lat, center.lng],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div style="
            background: #3b82f6;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    
    userLocationMarker = L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div style="font-family: Inter, sans-serif; font-size: 13px; color: #222;"><strong>📍 Your Location</strong></div>');

    // Force map to refresh
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    console.log("Displaying markers for", cafesData.length, "cafes");
    displayMarkers(cafesData);
    updateResultsCount(cafesData.length);
}

function displayMarkers(cafes) {
    console.log("displayMarkers called with", cafes.length, "cafes");
    clearMarkers();

    if (!cafes || cafes.length === 0) {
        console.warn("No cafes to display");
        return;
    }

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: #6F4E37;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: white;
        ">☕</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });

    cafes.forEach((cafe, index) => {
        console.log(`Adding marker ${index + 1}:`, cafe.name, `at [${cafe.lat}, ${cafe.lng}]`);
        
        const marker = L.marker([cafe.lat, cafe.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(createInfoWindowContent(cafe), {
                maxWidth: 280,
                className: 'minimal-popup'
            });

        markers.push(marker);
        markerObjects[cafe.id] = marker;
    });

    console.log("Added", markers.length, "markers to map");
}

function createInfoWindowContent(cafe) {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    const crowdLevel = cafe.crowd ? cafe.crowd[timeOfDay] : 'unknown';

    return `
        <div style="font-family: Inter, sans-serif; color: #222; padding: 4px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #6F4E37;">${cafe.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📍 ${cafe.address}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">🏙️ ${cafe.city}</p>
            <div style="display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap;">
                ${cafe.wifi ? '<span style="font-size: 11px; color: #6F4E37; font-weight: 500;">✓ Wi-Fi</span>' : ''}
                ${cafe.ac ? '<span style="font-size: 11px; color: #6F4E37; font-weight: 500;">✓ AC</span>' : ''}
                ${cafe.sockets === "high" || cafe.sockets === "medium" ? '<span style="font-size: 11px; color: #6F4E37; font-weight: 500;">✓ Charging</span>' : ''}
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
                ⏰ ${cafe.openHours.open}:00 - ${cafe.openHours.close}:00
                ${cafe.crowd ? ` • 👥 ${crowdLevel}` : ''}
            </div>
            ${cafe.rating ? `<div style="margin-top: 4px; font-size: 12px; color: #f59e0b;">⭐ ${cafe.rating}</div>` : ''}
        </div>
    `;
}

function clearMarkers() {
    markers.forEach(marker => {
        try {
            map.removeLayer(marker);
        } catch (e) {
            console.error("Error removing marker:", e);
        }
    });
    markers = [];
    markerObjects = {};
}

function applyFilters() {
    if (!map) {
        console.warn("Map not initialized yet");
        return;
    }

    let filteredCafes = [...cafesData];

    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput ? searchInput.value : '';
    
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredCafes = filteredCafes.filter(cafe => 
            cafe.name.toLowerCase().includes(query) ||
            cafe.city.toLowerCase().includes(query) ||
            cafe.address.toLowerCase().includes(query)
        );
    }

    if (selectedPurpose) {
        filteredCafes = filteredCafes.filter(cafe => 
            cafe.bestFor && cafe.bestFor.includes(selectedPurpose)
        );
    }

    if (filters.wifi) {
        filteredCafes = filteredCafes.filter(cafe => cafe.wifi);
    }

    if (filters.ac) {
        filteredCafes = filteredCafes.filter(cafe => cafe.ac);
    }

    if (filters.sockets) {
        filteredCafes = filteredCafes.filter(cafe =>
            cafe.sockets === "high" || cafe.sockets === "medium"
        );
    }

    console.log("Filtered cafes:", filteredCafes.length);
    displayMarkers(filteredCafes);
    updateResultsCount(filteredCafes.length);
    updateResetButton();
}

function updateResultsCount(count) {
    const resultsElement = document.getElementById('resultsCount');
    if (resultsElement) {
        resultsElement.textContent = `${count} cafe${count !== 1 ? 's' : ''} found`;
    }
}

function updateResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput ? searchInput.value : '';
    const hasFilters = selectedPurpose || filters.wifi || filters.ac || filters.sockets || searchQuery.trim();
    
    if (resetBtn) {
        resetBtn.style.display = hasFilters ? 'block' : 'none';
    }
}

function resetFilters() {
    selectedPurpose = '';
    filters = { wifi: false, ac: false, sockets: false };

    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const wifiFilter = document.getElementById('wifiFilter');
    const acFilter = document.getElementById('acFilter');
    const socketsFilter = document.getElementById('socketsFilter');
    const searchInput = document.getElementById('searchInput');

    if (wifiFilter) wifiFilter.checked = false;
    if (acFilter) acFilter.checked = false;
    if (socketsFilter) socketsFilter.checked = false;
    if (searchInput) searchInput.value = '';

    applyFilters();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing app...");

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }

    // Purpose buttons
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const purpose = btn.getAttribute('data-purpose');

            if (selectedPurpose === purpose) {
                selectedPurpose = '';
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                selectedPurpose = purpose;
                btn.classList.add('active');
            }

            applyFilters();
        });
    });

    // Infrastructure filters
    const wifiFilter = document.getElementById('wifiFilter');
    const acFilter = document.getElementById('acFilter');
    const socketsFilter = document.getElementById('socketsFilter');

    if (wifiFilter) {
        wifiFilter.addEventListener('change', (e) => {
            filters.wifi = e.target.checked;
            applyFilters();
        });
    }

    if (acFilter) {
        acFilter.addEventListener('change', (e) => {
            filters.ac = e.target.checked;
            applyFilters();
        });
    }

    if (socketsFilter) {
        socketsFilter.addEventListener('change', (e) => {
            filters.sockets = e.target.checked;
            applyFilters();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    // Initialize map
    initMap();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }
    });
});