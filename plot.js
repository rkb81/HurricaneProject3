const url = 'http://127.0.0.1:5000/api/v1.0/HurricaneLocationData'; 


let map;
let markersLayer;
let hurricanes;
let selectedYear; 
function initMap() {
  map = L.map('map').setView([19, -99], 5); // Set initial map view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  const yearSelect = document.getElementById('yearSelect');
  const hurricaneSelect = document.getElementById('hurricaneSelect');
  const countrySelect = document.getElementById('countrySelect');
  
  const years = [...new Set(hurricanes.map(d => new Date(d.Datetime).getFullYear()))];
  const hurricaneNames = [...new Set(hurricanes.map(d => d.Name))];
  const countries = [...new Set(hurricanes.map(d => d.country))];


  // Populate year and hurricane select dropdowns
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
  });

  hurricaneNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.text = name;
    hurricaneSelect.appendChild(option);
  });

  // Populate country select dropdown
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.text = country || 'Unknown';
    countrySelect.appendChild(option);
  });

  yearSelect.addEventListener('change', updateMap);
  hurricaneSelect.addEventListener('change', updateMap);
  countrySelect.addEventListener('change', updateMap);;
  // hurricaneDropdown.addEventListener('change', updateHurricaneInfo);
  
  updateAll(); 
  
}


function updateMap() {
  const selectedYear = parseInt(yearSelect.value);
  const selectedHurricane = hurricaneSelect.value;
  const selectedCountry = countrySelect.value;
  const noDataMessage = document.getElementById('noDataMessage');

  if (map && markersLayer) {
    markersLayer.clearLayers(); // Clear existing markers

    // Check if "All" is selected for both year and hurricane name
    //const isAllSelected = selectedYear === 'All' && selectedHurricane === 'All';

    const filteredData = hurricanes.filter(h => {
      const year = new Date(h.Datetime).getFullYear();
      const name = h.Name;
      const country = h.country || 'Unknown';
      return(
       (selectedYear === 'All' || year === selectedYear) &&
       (selectedHurricane === 'All' || name === selectedHurricane) &&
       (selectedCountry === 'All' || country === selectedCountry)
     );
    });

    if (filteredData.length === 0) {
      noDataMessage.style.display = 'block';
    } else {
      noDataMessage.style.display = 'none';
    }

    filteredData.forEach(h => {
      const year = new Date(h.Datetime).getFullYear();
      const name = h.Name;
      const country = h.country || 'Unknown';

      L.marker([h.Latitude, h.Longitude])
        .bindPopup(`Year: ${year}<br>Name: ${name}<br>Country: ${country}`)
        .addTo(markersLayer);
    });
  }
}


// function updateAll() {
//   const yearSelect = document.getElementById('yearSelect');
//   const hurricaneSelect = document.getElementById('hurricaneSelect');

//   // Set the selected values for the dropdowns to "All"
//   yearSelect.value = 'All';
//   hurricaneSelect.value = 'All'
//   console.log(hurricanes);
//   if (map && markersLayer) {
//     markersLayer.clearLayers(); // Clear existing markers

//     hurricanes.forEach(h => {
//       const year = new Date(h.Datetime).getFullYear();
//       const name = h.Name;
//       const country = h.country || 'Unknown';

//       //if (year === selectedYear && (selectedHurricane === 'All' || name === selectedHurricane)) {
//         L.marker([h.Latitude, h.Longitude])
//           .bindPopup(`Year: ${year}<br>Name: ${name}<br>Country: ${country}`)
//           .addTo(markersLayer); // Add the marker to the markersLayer instead of directly to the map
//       }
//     //}
//     );
//   }
// }

function updateAll() {
  const yearSelect = document.getElementById('yearSelect');
  const hurricaneSelect = document.getElementById('hurricaneSelect');
  const selectedCountry = countrySelect.value;

  // Set the selected values for the dropdowns to "All"
  yearSelect.value = 'All';
  hurricaneSelect.value = 'All';
  countrySelect.value = 'All';

  if (map && markersLayer) {
    markersLayer.clearLayers(); // Clear existing markers

    const filteredData = hurricanes.filter(h => {
      const year = new Date(h.Datetime).getFullYear();
      const name = h.Name;
      const country = h.country || 'Unknown';

      return (
        (selectedYear === 'All' || year === selectedYear) &&
        (selectedHurricane === 'All' || name === selectedHurricane) &&
        (selectedCountry === 'All' || country === selectedCountry)
      );
    });


    // Group data by hurricane name
    const hurricanesGrouped = {};
    hurricanes.forEach(h => {
      const name = h.Name;
      if (!hurricanesGrouped[name]) {
        hurricanesGrouped[name] = [];
      }
      hurricanesGrouped[name].push(h);
    });

    // Create lines connecting the points for each hurricane
    for (const name in hurricanesGrouped) {
      const hurricaneData = hurricanesGrouped[name];
      const latLngs = hurricaneData.map(h => [h.Latitude, h.Longitude]);
      const polyline = L.polyline(latLngs, { color: getRandomColor() }).addTo(map);

      // Add popup to the polyline with detailed information
      const popupContent = generatePopupContent(hurricaneData);
      polyline.bindPopup(popupContent);
    }
  }
}

// Helper function to generate random colors for each hurricane path
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function generatePopupContent(hurricaneData) {
  let content = '<div class="popup-content"><b>Hurricane Information:</b><br>';
  hurricaneData.forEach(h => {
    const country = h.country || 'Unknown';
    const name = h.Name;
    const windSpeed = h.WindSpeed;
    const airPressure = h.AirPressure;
    const datetime = new Date(h.Datetime).toLocaleString();

    content += `<b>Country:</b> ${country}<br>`;
    content += `<b>Hurricane Name:</b> ${name}<br>`;
  });
  content += '</div>';

  return content;
}

document.addEventListener('DOMContentLoaded', () => {
  d3.json(url).then(data => {
   hurricanes = data.data;
   
   initMap(); // Initialize the map after loading the data
  });
  });