// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
var places;
function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  document.getElementById('submit').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    places = searchBox.getPlaces();

    //クリップボードに表示
    var option_element = document.createElement("option");
    option_element.innerHTML = '<option value='+places[0].formatted_address+'>'+places[0].name+'</option>';
    var parent_object = document.getElementById("waypoints");
    parent_object.appendChild(option_element);

    console.log(places);

    if (places.length == 0) {
      return;
    }

    // // Clear out the old markers.
    // markers.forEach(function(marker) {
    //   marker.setMap(null);
    // });

    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);

  });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var waypts = [];
  var checkboxArray = document.getElementById('waypoints');
  for (var i = 2; i < checkboxArray.length; i++) {
   if (checkboxArray.options[i].selected) {
     waypts.push({
       location: checkboxArray[i].value,
       stopover: true
     });
   }
  }

  directionsService.route({
   origin: checkboxArray[0].value,
   destination: checkboxArray[1].value,
   waypoints: waypts,
   optimizeWaypoints: true,
   travelMode: 'DRIVING'
  }, function(response, status) {
   if (status === 'OK') {
     directionsDisplay.setDirections(response);
     var route = response.routes[0];
     var summaryPanel = document.getElementById('directions-panel');
     summaryPanel.innerHTML = '';
     // For each route, display summary information.
     for (var i = 0; i < route.legs.length; i++) {
       var routeSegment = i + 1;
       summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
           '</b><br>';
       summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
       summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
       summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
     }
   } else {
     window.alert('Directions request failed due to ' + status);
   }
  });
}
