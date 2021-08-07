// initialize the map
var map = L.map('map', {
    renderer: L.canvas({
        tolerance: 10
    })
}).setView([42.5206, 20.0073], 10);

var DATA = {
    track_1: {
        id: 1,
        url: 'data/001-Theth-Valbona.gpx',
        color: "#3490dc",
        name: "Theth-Valbona",
    },
    track_2: {
        id: 2,
        url: 'data/002-Valbona-Cerem.gpx',
        color: "#f6993f",
        name: "Valbona-Cerem",
    },
    track_3: {
        id: 3,
        url: 'data/003-Cerem-Doberdol.gpx',
        color: "red",
        name: "Cerem-Doberdol",
    },
    track_4: {
        id: 4,
        url: 'data/004-Doberdol-Milishevc.gpx',
        color: "purple",
        name: "Doberdol-Milishevc",
    },
    /*    track_5: {
        id: 5,
        url: 'data/test1.gpx',
        color: "yellow",
        name: "Doberdol-Milishevc",
    },
        track_6: {
        id: 6,
        url: 'data/test2.gpx',
        color: "black",
        name: "Doberdol-Milishevc",
    },*/
}
var HOSTCATEGORIES = [
    'pension',
    'hotel',
    'guesthouse',
    'hut'
]
var elevation_options = {
    // Default chart colors: theme lime-theme, magenta-theme, ...
    theme: "lightblue-theme",
    // Chart container outside/inside map container
    detached: false,
    width: 400,
    // if (detached), the elevation chart container
    //elevationDiv: "#elevationProfile",
    // if (!detached) autohide chart profile on chart mouseleave
    autohide: false,
    // if (!detached) initial state of chart profile control
    collapsed: true,
    // if (!detached) control position on one of map corners
    position: "bottomright",
    // Autoupdate map center on chart mouseover.
    followMarker: true,
    // Autoupdate map bounds on chart update.
    autofitBounds: true,
    // Chart distance/elevation units.
    imperial: false,
    // [Lat, Long] vs [Long, Lat] points. (leaflet default: [Lat, Long])
    reverseCoords: false,
    // Acceleration chart profile: true || "summary" || "disabled" || false
    acceleration: false,
    // Slope chart profile: true || "summary" || "disabled" || false
    slope: false,
    // Speed chart profile: true || "summary" || "disabled" || false
    speed: false,
    // Display time info: true || "summary" || false
    time: false,
    // Display distance info: true || "summary"
    distance: true,
    // Display altitude info: true || "summary"
    altitude: true,
    // Summary track info style: "line" || "multiline" || false
    summary: 'inline',
    // Toggle chart ruler filter.
    ruler: true,
    // Toggle chart legend filter.
    legend: false,
    // Toggle "leaflet-almostover" integration
    almostOver: false,
    // Toggle "leaflet-distance-markers" integration
    //distanceMarkers: true,
    useLeafletMarker: true,
    // Render chart profiles as Canvas or SVG Paths
    preferCanvas: false
};
// load a tile layer
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
})
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(map);
var baseLayers = {
    "Topo": OpenTopoMap,
    "Light": CartoDB_Positron
};


var overlays = {};
var controlElevation = L.control.elevation(elevation_options);
controlElevation.loadChart(map);
controlElevation.hide()
var layerControl = L.control.layers(baseLayers, overlays).addTo(map);


function loadTrace(track, i, mode) {
    var trace = {};
    trace.gpx = new L.GPX(tracks[track].url, {
        async: true,
        index: i,
        marker_options: {
            startIconUrl: null,
            endIconUrl: null,
            shadowUrl: null,
        },
        polyline_options: {
            color: tracks[track].color,
            id: tracks[track].id
        }
    });
    trace.gpx.on('loaded', function (e) {
        layerControl.addOverlay(e.target, tracks[track].name);
        e.target.addTo(routes)
        map.fitBounds(routes.getBounds());
        if (mode == "single") {
            controlElevation.show()
            
            setElevationTrace(0);
            
        }
    })
    trace.gpx.on('click', function (e) {

        
        if (mode == "single") {
            setElevationTrace(0, e.target.options.polyline_options.color);
        } else {
            controlElevation.show();
            e.target.bindPopup("<a href='#" + e.target.options.polyline_options.id + "' onclick='setTimeout(location.reload.bind(location), 1)'>Details</a>").openPopup();
            setElevationTrace(e.target.options.index, e.target.options.polyline_options.color)
        }
    })
    trace.gpx.on("addline", function (e) {
        trace.line = e.line;
    })

    trace.gpx.addTo(map);
    traces.push(trace);
}

function setElevationTrace(index, color) {
    for (i in traces){
        traces[i].line.options.color = traces[i].gpx.options.polyline_options.color;
    }
    //console.log(color);
    var trace = traces[index];
    controlElevation.clear();
    var q = document.querySelector.bind(document);
    controlElevation.addData(trace.line);
    map.fitBounds(trace.gpx.getBounds());
    function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Usage!
sleep(1000).then(() => {
    controlElevation._expand()
});

}

let hashes = window.location.hash;
var routes = new L.featureGroup();
if (parseInt(hashes.split("#")[1]) >= 0) {
    var traces = [];
    var tracks = DATA;
    console.log("single");
    for (var track in tracks) {
        if (tracks[track].id == parseInt(hashes.split("#")[1])) {
            loadTrace(track, parseInt(hashes.split("#")[1]), "single")
        }
    }
} else {
    var traces = [];
    var tracks = DATA;
    console.log("all");
    var i = 0;

    for (var track in tracks) {
        console.log(track)
        loadTrace(track, i++, "")
    }


}
id = "19OlGztoPXBhquu674QW02aadb4TINQBX9gODSY7hi54"; //ricardo
id2 = "1qemF3mEQGON_YomDqP-0_CSsYZJL_yOQSitGKrtdAhM"; //riccardo
$.getJSON("https://spreadsheets.google.com/feeds/list/" + id + "/1/public/values?alt=json", function (data) {
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
        var cat = entry['gsx$category']['$t'];
        var image = entry['gsx$photo']['$t'];
        var loc = entry['gsx$location']['$t'];
        var txt = entry['gsx$description']['$t'];
        var popupText = loc + ": <b>" + title + "</b><br>" + "<img class='popupImage' src='" + image + "'></img><br>" + txt.substr(0, 80) + "<a href='" + "http://digital-geography.com" + "' target='_blank'>...more</a>";
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation, {
            icon: L.icon({
                iconUrl: 'images/iconDefault.png',
                shadowUrl: 'images/pin-shadow.png',
                iconSize: [48, 64], // size of the icon
                shadowSize: [64, 80], // size of the shadow
                iconAnchor: [24, 65], // point of the icon which will correspond to marker's location
                shadowAnchor: [24, 81], // the same for the shadow
                popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
            })
        }).bindPopup(popupText);
        console.log(title)
        group.addLayer(marker);
        marker.on('click', function (e) {
            this.openPopup();
        });
    }
    map.addLayer(group);
});

var logo = L.control({
    position: 'topleft'
});
logo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'myControl');
    var img_log = "<div class='myClass'><img src=\"images/logo.png\" width='30px'></img></div>";
    this._div.innerHTML = img_log;
    return this._div;
}
logo.addTo(map);

// adding hosts
$.getJSON("https://spreadsheets.google.com/feeds/list/" + id + "/2/public/values?alt=json", function (data) {
    //first row "title" column
    var entries = data.feed.entry;
    var hosts = new L.featureGroup();
    //Loop through spreadsheet entries
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        //Assuming we have columns with these names
        var title = entry['gsx$title']['$t'];
        var lon = entry['gsx$lon']['$t'];
        var lat = entry['gsx$lat']['$t'];
        var cat = entry['gsx$category']['$t'];
        var image = entry['gsx$photo']['$t'];
        var loc = entry['gsx$location']['$t'];
        var txt = entry['gsx$description']['$t'];
        var popupText = loc + ": <b>" + title + "</b><br>" + "<img class='popupImage' src='" + image + "'></img><br>" + txt.substr(0, 80) + "<a href='" + "http://digital-geography.com" + "' target='_blank'>...more</a>";
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation, {
            icon: L.icon({
                iconUrl: 'images/icon.png',
                shadowUrl: 'images/pin-shadow.png',
                iconSize: [48, 64], // size of the icon
                shadowSize: [64, 80], // size of the shadow
                iconAnchor: [24, 65], // point of the icon which will correspond to marker's location
                shadowAnchor: [24, 81], // the same for the shadow
                popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
            })
        }).bindPopup(popupText);
        console.log(title)
        hosts.addLayer(marker);
        marker.on('click', function (e) {
            this.openPopup();
        });
    }
    map.addLayer(hosts);
    layerControl.addOverlay(hosts, "Hosts");
});