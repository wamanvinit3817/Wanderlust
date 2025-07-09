mapboxgl.accessToken = mapToken;
const mapDiv = document.getElementById("map");
const coordinates = JSON.parse(mapDiv.dataset.coords);



console.log(coordinates)
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: coordinates,
  zoom: 9
});

const marker = new mapboxgl.Marker({color:'#fe424d'})
    .setLngLat(coordinates)
    .addTo(map);

 const popup = new mapboxgl.Popup({offset: 25})
    .setLngLat(coordinates)
    .setHTML(`
    
    <p>Exact location will be provided after booking.</p>
    
    <a href="https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]} " target="_blank" id="mapurl">
      View on Google Maps
    </a>
  `)
    .setMaxWidth("300px")
    
    .addTo(map);
    // const coordinates = [72.87872, 19.077793]; // [lng, lat]

// const marker2 = new mapboxgl.Marker()
//   .setLngLat(coordinates)
//   .setPopup(new mapboxgl.Popup().setHTML(`
//     <h6>View in Google Maps</h6>
//     <a href="https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}" target="_blank">
//       Open Google Maps
//     </a>
//   `))
//   .addTo(map);





