mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'map',
    center: campground.geometry.coordinates,
    zoom: 10,
    style: 'mapbox://styles/mapbox/outdoors-v11'
});

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h5>${campground.title}</h5><p>${campground.location}</p>`
            )
    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');