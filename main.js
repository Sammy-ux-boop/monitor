// Initialize the map
var map = L.map('map').setView([0, 37.5], 6);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON data
axios.get('constituencies.geojson')
    .then(function (response) {
        var geojsonData = response.data;
        renderMap(geojsonData, '2024'); // Default year to render
    })
    .catch(function (error) {
        console.error('Error loading GeoJSON data:', error);
    });

// Function to render the map based on the selected year
function renderMap(geojsonData, year) {
    // Clear existing layers
    map.eachLayer(function (layer) {
        if (layer.feature) {
            map.removeLayer(layer);
        }
    });

    L.geoJson(geojsonData, {
        style: function (feature) {
            var vote = feature.properties["Voting " + year];
            var color;
            if (vote === 'yes') {
                color = 'green';
            } else if (vote === 'no') {
                color = 'red';
            } else if (vote === 'abstain') {
                color = 'yellow';
            } else {
                color = 'gray';
            }
            return { color: color, weight: 1, fillOpacity: 0.6 };
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                updateInfoPanel(feature, year);
            });
        }
    }).addTo(map);
}

// Function to update the info panel with feature details
function updateInfoPanel(feature, year) {
    var constituency = feature.properties.CONSTITUEN;
    var county = feature.properties.COUNTY_NAM;
    var mpName = feature.properties.MP_NAME;
    var party =feature.properties.Political_Party;
    var mpImageUrl = feature.properties.MP_IMAGE_URL;
    var vote = feature.properties["Voting " + year];
    
    var infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `
        <h><strong>Constituency</strong>:${constituency}</h>
        <p><strong>County:</strong> ${county}</p>
        <p><strong>Political Party</strong> ${party}</p>
        <p><strong>MP:</strong> ${mpName}</p>
        <img src="${mpImageUrl}" alt="${mpName}" style="width:100px;height:auto;">
        <p><strong>Vote ${year}:</strong> ${vote}</p>
    `;
}

// Event listener for year selection
document.getElementById('year-select').addEventListener('change', function() {
    var selectedYear = this.value;
    axios.get('constituencies.geojson')
        .then(function (response) {
            var geojsonData = response.data;
            renderMap(geojsonData, selectedYear);
        })
        .catch(function (error) {
            console.error('Error loading GeoJSON data:', error);
        });
});

// Static texts array
const staticTexts = [
    "Observe Your Member of Parliament",
    "Stay Informed About Legislative Changes",
    "Participate in Your Democracy",
    "Vote Wisely for Your Future"
];

// Index to track current static text
let staticTextIndex = 0;

// Function to update static text
function updateStaticText() {
    const staticTextElement = document.querySelector('.static-text');
    staticTextElement.textContent = staticTexts[staticTextIndex];
    
    staticTextIndex = (staticTextIndex + 1) % staticTexts.length; // Loop through texts
}

// Initial call to update static text
updateStaticText();

// Optionally, update static text at intervals (e.g., every 10 seconds)
setInterval(updateStaticText, 10000); // 10000 milliseconds = 10 seconds

