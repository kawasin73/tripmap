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
    center: {lat: 35.69167 ,lng: 139.765},
    zoom: 10,
    mapTypeId: 'roadmap'
  });
  directionsDisplay.setMap(map);
  new AutocompleteDirectionsHandler(map);

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

  this.setupPlaceChangedListener(map,originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(map,destinationAutocomplete, 'DEST');

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('via-input');
  var searchBox = new google.maps.places.SearchBox(input);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


  // Bias the SearchBox results towards current map's viewport.
  this.map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

//中継地点変更した時
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

    // For each place, get the icon, name and location.
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        // icon: icon,
        title: place.name,
        position: place.geometry.location
      }));
      var bounds = new google.maps.LatLngBounds();
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);
    });

  });
  console.log("AutocompleteDirectionsHandler終わり");
}


// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.ラジオボタン
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
 var radioButton = document.getElementById(id);
 var me = this;
 radioButton.addEventListener('click', function() {
   travelMode = mode;
   // me.route();
 });
 console.log("setupClickListener終わり");
};

//出発・到着地を変更した時
AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(map,autocomplete, mode) {
 var me = this;
 autocomplete.bindTo('bounds', map);
 autocomplete.addListener('place_changed', function() {
   var place = autocomplete.getPlace();
   if (!place.place_id) {
     window.alert("Please select an option from the dropdown list.");
     return;
   }
   console.log(place);
   // Create a marker for each place.
   markers.push(new google.maps.Marker({
     map: map,
     // icon: icon,
     title: place.name,
     position: place.geometry.location
   }));
   var bounds = new google.maps.LatLngBounds();
   if (place.geometry.viewport) {
     // Only geocodes have viewport.
     bounds.union(place.geometry.viewport);
   } else {
     bounds.extend(place.geometry.location);
   }


   if (mode === 'ORIG') {
     originPlaceId = place.place_id;
   } else {
     destinationPlaceId = place.place_id;
   }
 });
 console.log("setupPlaceChangedListener終わり");
};



//ルート計算
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  if (!originPlaceId || !destinationPlaceId) {
     return;
   }
  var waypts=[];
  var checkboxArray = document.getElementById('waypoints');
  for (var i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray.options[i].selected) {
      console.log('waypts:'+checkboxArray[i].id);
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
      // /*marker delete*/
      // markers.forEach(function(marker) {
      //   marker.setMap(null);
      // });
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
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br>';
        summaryPanel.innerHTML += route.legs[i].duration.text + '<br><br>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
