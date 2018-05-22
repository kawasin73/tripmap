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
  // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


  // Bias the SearchBox results towards current map's viewport.
  this.map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

//中継地点変更した時
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    //クリップボードに表示
    var label_element=document.createElement("label") ;
    var txt=document.createTextNode(places[0].name);
    label_element.innerHTML="<input type='checkbox' name='checkbox01' class='checkbox01-input' value="+places[0].formatted_address+"><span class='checkbox01-parts'>"+places[0].name+"</span><br>";
    var parent_object = document.getElementById("waypoints");
    parent_object.appendChild(label_element);

    console.log(places[0].name);

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
      //info window
      var infowin = new google.maps.InfoWindow({content:place.name});
      markers.forEach(function(marker){
        // mouseoverイベントを取得するListenerを追加
        google.maps.event.addListener(marker, 'mouseover', function(){
            infowin.open(map, marker);
        });
        // mouseoutイベントを取得するListenerを追加
        google.maps.event.addListener(marker, 'mouseout', function(){
            infowin.close();
        });
        //click che
        google.maps.event.addListener(marker, 'click', function(){
            if($(".checkbox01-input[value="+place.formatted_address+"]").prop("checked")){
                $(".checkbox01-input[value="+place.formatted_address+"]").prop("checked",false);
            }else{
                $(".checkbox01-input[value="+place.formatted_address+"]").prop("checked",true);
            };
        });
      });


      var bounds = new google.maps.LatLngBounds();
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);
    });
    var viapoint=document.getElementById('via-input');
    viapoint.value=null;

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
    map.fitBounds(bounds);

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
    alert("出発地または到着地を正しく選択して下さい");
    return;
  }
  var waypts=[];
  var checkboxArray=document.getElementsByClassName('checkbox01-input');
  console.log(checkboxArray[0]);
  for (var i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray[i].checked) {
      console.log('waypts:'+checkboxArray[i].value);
      waypts.push({
        location: checkboxArray[i].value,
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
      summaryPanel.innerHTML = '<br><hr>';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>区間: ' + routeSegment +
          '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' から ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += '<h4>距離：'+route.legs[i].distance.text + '</h4>';
        summaryPanel.innerHTML += '<h4>時間：'+route.legs[i].duration.text + '</h4><hr>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
