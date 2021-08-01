// initialize the map
var map = L.map('map').setView([42.5206, 20.0073], 10);

// load a tile layer
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);
var baseLayers = {
    "Streets": CartoDB_Positron
};
//loading gpx tracks

var DATA = ['data/001-Theth-Valbona.gpx',
    'data/002-Valbona-Cerem.gpx',
    'data/003-Cerem-Doberdol.gpx',
    'data/004-Doberdol-Milishevc.gpx'
]

var NAMES = [
    "Theth-Valbona",
    "Valbona-Cerem",
    "Cerem-Doberdol",
    "Doberdol-Milishevc"
];
var overlays = {};
var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

function loadRoute(routeId) {
    var route = new L.GPX(DATA[routeId], {
        async: true,
        id: NAMES[routeId]
    }).on('loaded', function (e) {
        map.fitBounds(e.target.getBounds());
        layerControl.addOverlay(route, NAMES[routeId]);

    }).addTo(map);
}


function addAll() {
    var layerGroup = L.featureGroup({
        id: "allRoutes"
    });
    for (i = 0; i < DATA.length; i++) {
        window['route' + String(i)] = new L.GPX(DATA[i], {
            async: true,
            id: NAMES[i]
        }).on('loaded', function (e) {
            console.log(e)
        }).addTo(layerGroup).addTo(map);
    }
    layerGroup.eachLayer(function (layer) {
        layerControl.addOverlay(layer, layer.options.id);
    });
    return layerGroup
}
async function loadAll() {


    let promise = new Promise((resolve, reject) => {
        layerGroup = addAll();
        setTimeout(() => resolve(layerGroup), 1000)
    });

    let result = await promise; // wait until the promise resolves (*)
    map.fitBounds(result.getBounds()); // "done!"
}

let hashes = window.location.hash;
console.log(hashes);
if (hashes.split("#")[1] != "all") {
    loadRoute(hashes.split("#")[1])
} else {
    loadAll()
}

$.getJSON("https://spreadsheets.google.com/feeds/list/1qemF3mEQGON_YomDqP-0_CSsYZJL_yOQSitGKrtdAhM/1/public/values?alt=json", function (data) {
    //first row "title" column
    var entries = data.feed.entry;
    var group = new L.featureGroup();
    //Loop through spreadsheet entries
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        //Assuming we have columns with these names
        var title = entry['gsx$title']['$t'];
        var lon = entry['gsx$lon']['$t'];
        var lat = entry['gsx$lat']['$t'];
        var popupText = title;
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation);
        group.addLayer(marker);

        marker.bindPopup(popupText);

    }
    map.addLayer(group);
});