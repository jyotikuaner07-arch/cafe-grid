let map;
let markers = [];
let selectedPurpose = '';
let filters = {
    wifi: false,
    ac: false,
    sockets: false
};

// Initialize map
function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                createMap(pos);
            },
            () => {
                const defaultPos = { lat: 20.2961, lng: 85.8245 };
                createMap(defaultPos);
            }
        );
    } else {
        const defaultPos = { lat: 20.2961, lng: 85.8245 };
        createMap(defaultPos);
    }
}

function createMap(center) {
    // Initialize Leaflet map
    map = L.map('map').setView([center.lat, center.lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);

    displayMarkers(cafesData);
    updateResultsCount(cafesData.length);
}

function displayMarkers(cafes) {
    clearMarkers();

    // Custom icon for markers
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: linear-gradient(135deg, #8B5CF6, #EC4899);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        ">☕</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    cafes.forEach(cafe => {
        const marker = L.marker([cafe.lat, cafe.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(createInfoWindowContent(cafe), {
                maxWidth: 300,
                className: 'custom-popup'
            });

        markers.push(marker);
    });
}

function createInfoWindowContent(cafe) {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    const crowdLevel = cafe.crowd[timeOfDay];
    const crowdColor = crowdLevel === 'low' ? '#10b981' : crowdLevel === 'medium' ? '#f59e0b' : '#ef4444';

    return `
        <div style="padding: 16px; font-family: 'Inter', sans-serif; max-width: 280px;">
            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${cafe.name}</h3>
            <div style="display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap;">
                ${cafe.wifi ? '<span style="background: #e9d5ff; color: #7e22ce; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">📶 Wi-Fi</span>' : ''}
                ${cafe.ac ? '<span style="background: #e9d5ff; color: #7e22ce; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">❄️ AC</span>' : ''}
                ${cafe.sockets !== 'low' ? '<span style="background: #e9d5ff; color: #7e22ce; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">⚡ Charging</span>' : ''}
            </div>
            <div style="margin: 10px 0; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                    <strong style="color: #374151;">Hours:</strong> ${cafe.openHours.open}:00 - ${cafe.openHours.close}:00
                </p>
                <p style="margin: 0; font-size: 13px; color: #6b7280;">
                    <strong style="color: #374151;">Crowd Now:</strong> 
                    <span style="color: ${crowdColor}; font-weight: 600; text-transform: capitalize;">${crowdLevel}</span>
                </p>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; font-style: italic;">
                Best for: ${cafe.bestFor.join(', ')}
            </p>
        </div>
    `;
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function applyFilters() {
    let filteredCafes = [...cafesData];

    if (selectedPurpose) {
        filteredCafes = filteredCafes.filter(cafe => cafe.bestFor.includes(selectedPurpose));
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

    displayMarkers(filteredCafes);
    updateResultsCount(filteredCafes.length);
    updateResetButton();
}

function updateResultsCount(count) {
    const resultsElement = document.getElementById('resultsCount');
    resultsElement.textContent = `${count} ${count === 1 ? 'cafe' : 'cafes'} found`;
}

function updateResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    const hasFilters = selectedPurpose || filters.wifi || filters.ac || filters.sockets;
    resetBtn.style.display = hasFilters ? 'flex' : 'none';
}

function resetFilters() {
    selectedPurpose = '';
    filters = { wifi: false, ac: false, sockets: false };

    document.querySelectorAll('.purpose-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('wifiFilter').checked = false;
    document.getElementById('acFilter').checked = false;
    document.getElementById('socketsFilter').checked = false;

    applyFilters();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Purpose buttons
    document.querySelectorAll('.purpose-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const purpose = btn.getAttribute('data-purpose');

            if (selectedPurpose === purpose) {
                selectedPurpose = '';
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
                selectedPurpose = purpose;
                btn.classList.add('active');
            }

            applyFilters();
        });
    });

    // Infrastructure filters
    document.getElementById('wifiFilter').addEventListener('change', (e) => {
        filters.wifi = e.target.checked;
        applyFilters();
    });

    document.getElementById('acFilter').addEventListener('change', (e) => {
        filters.ac = e.target.checked;
        applyFilters();
    });

    document.getElementById('socketsFilter').addEventListener('change', (e) => {
        filters.sockets = e.target.checked;
        applyFilters();
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetFilters);

    // Mobile filter toggle
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const sidebar = document.getElementById('sidebar');

    mobileFilterBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileFilterBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Initialize map
    initMap();
});