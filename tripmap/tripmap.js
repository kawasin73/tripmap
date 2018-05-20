// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initAutocomplete() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13,
    mapTypeId: 'roadmap'
  });
  directionsDisplay.setMap(map);
  new AutocompleteDirectionsHandler(map);

  // // Create the search box and link it to the UI element.
  // var input = document.getElementById('pac-input');
  // var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


  document.getElementById('submit').addEventListener('click', function() {
    new calculateAndDisplayRoute(directionsService,directionsDisplay);
    console.log("aaa");
  });
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.

}
/**/

var originPlaceId;
var destinationPlaceId;
var travelMode;
var markers = [];
function AutocompleteDirectionsHandler(map) {
  this.map = map;
  originPlaceId = null;
  destinationPlaceId = null;
  travelMode = 'WALKING';

  var originInput = document.getElementById('origin-input');
  var destinationInput = document.getElementById('destination-input');
  var modeSelector = document.getElementById('mode-selector');
  // this.directionsService = new google.maps.DirectionsService;
  // this.directionsDisplay = new google.maps.DirectionsRenderer;
  // this.directionsDisplay.setMap(map);

  var originAutocomplete = new google.maps.places.Autocomplete(originInput);
  var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

  this.setupClickListener('changemode-walking', 'WALKING');
  this.setupClickListener('changemode-transit', 'TRANSIT');
  this.setupClickListener('changemode-driving', 'DRIVING');

  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('via-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);



  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    //クリップボードに表示
    var option_element=document.createElement("option") ;
    var txt=document.createTextNode(places[0].name);
    option_element.id=places[0].formatted_address;
    option_element.appendChild(txt);
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

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      // var icon = {
      //   url: place.icon,
      //   size: new google.maps.Size(71, 71),
      //   origin: new google.maps.Point(0, 0),
      //   anchor: new google.maps.Point(17, 34),
      //   scaledSize: new google.maps.Size(25, 25)
      // };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        // icon: icon,
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
  console.log("AutocompleteDirectionsHandler終わり");
}


// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
 var radioButton = document.getElementById(id);
 var me = this;
 radioButton.addEventListener('click', function() {
   travelMode = mode;
   // me.route();
 });
 console.log("setupClickListener終わり");
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
 var me = this;
 autocomplete.bindTo('bounds', this.map);
 autocomplete.addListener('place_changed', function() {
   var place = autocomplete.getPlace();
   if (!place.place_id) {
     window.alert("Please select an option from the dropdown list.");
     return;
   }
   console.log(place);
   // // Create a marker for each place.
   // markers.push(new google.maps.Marker({
   //   map: this.map,
   //   // icon: icon,
   //   title: place.name,
   //   position: place.geometry.location
   // }));
   if (mode === 'ORIG') {
     originPlaceId = place.place_id;
   } else {
     destinationPlaceId = place.place_id;
   }
   // me.route();
 });
 console.log("setupPlaceChangedListener終わり");
};

//
// AutocompleteDirectionsHandler.prototype.route = function () {
//  if (!originPlaceId || !destinationPlaceId) {
//    return;
//    console.log("naiyo");
//  }
//  var me = this;
//
//  this.directionsService.route({
//    origin: {'placeId': originPlaceId},
//    destination: {'placeId': destinationPlaceId},
//    travelMode: travelMode
//  }, function(response, status) {
//    if (status === 'OK') {
//      me.directionsDisplay.setDirections(response);
//      var route = response.routes[0];
//      var summaryPanel = document.getElementById('directions-panel');
//      summaryPanel.innerHTML = '';
//      // For each route, display summary information.
//      for (var i = 0; i < route.legs.length; i++) {
//        var routeSegment = i + 1;
//        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
//            '</b><br>';
//        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
//        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
//        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
//      }
//    } else {
//      window.alert('Directions request failed due to ' + status);
//    }
//  });
//
//  console.log("route終わり");
// };


function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  console.log('waypts前');
  var waypts=[];
  var checkboxArray = document.getElementById('waypoints');
  for (var i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray.options[i].selected) {
      console.log('wayptsあった'+checkboxArray[i].id);
      waypts.push({
      　location: checkboxArray[i].id,
        stopover: true
      });
    }
  }

  directionsService.route({
    origin: {'placeId': originPlaceId},
    destination: {'placeId': destinationPlaceId},
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: travelMode
  }, function(response, status) {
    console.log(originPlaceId+" "+destinationPlaceId+" "+waypts);
    if (status === 'OK') {
      /*marker delete*/
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      /**/
      console.log(response);
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
