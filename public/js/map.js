mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
        container: 'map', // container ID
        // center: [77.2088, 28.6139], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        center: listing.geometry.coordinates,   // To add a marker to the location added of new listing. 
        zoom: 8 // starting zoom
});
const marker1 = new mapboxgl.Marker({color: "red"})
        .setLngLat(listing.geometry.coordinates)    // We will get the values of these longitue and latitude from the database documents of listing >> geometry. There we store coordinates. 
        .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(`<h5>${listing.location}</h5>`))
        .addTo(map);
