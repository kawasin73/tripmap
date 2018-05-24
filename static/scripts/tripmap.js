// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// URL: http://studio-key.com/1910.html
function randUser(n) {
  var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  str = str.split('');
  var s = '';
  for (var i = 0; i < n; i++) {
    s += str[Math.floor(Math.random() * str.length)];
  }
  return s;
}


var user = localStorage.getItem("userName");
if (!user) {
  user = randUser(32);
  localStorage.setItem("userName", user);
}
console.log("userName: ", user);

var localData = {
  ids: [],
  set: function (place) {
    localStorage.setItem(place.place_id, JSON.stringify(place));
    this.ids.push(place.place_id);
    localStorage.setItem("clips", JSON.stringify(this.ids));
  },
  getAll: function () {
    return this.ids.map(function (id) {
      return JSON.parse(localStorage.getItem(id));
    })
  },
  setup: function () {
    this.ids = JSON.parse(localStorage.getItem("clips") || "[]");
  }
};

function initAutocomplete() {
  localData.setup()
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.69167, lng: 139.765 },
    zoom: 10,
    mapTypeId: 'roadmap'
  });
  directionsDisplay.setMap(map);
  new AutocompleteDirectionsHandler(map);

  document.getElementById('submit').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService,directionsDisplay);
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

  console.log("get all ", localData.getAll());
  localData.getAll().forEach(function (place) {
    appendClipHtml(place);
    var marker = createMarker(map, place);
    markers.push(marker);
  });

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

  this.setupPlaceChangedListener(map, originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(map, destinationAutocomplete, 'DEST');

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('via-input');
  var searchBox = new google.maps.places.SearchBox(input);

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);



//中継地点変更した時
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    var place = places[0];

    postClip(place.place_id);
    localData.set(place);

    //クリップボードに表示
    appendClipHtml(place);

    console.log(place.name);

    // For each place, get the icon, name and location.
    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }

    var marker = createMarker(map, place);
    markers.push(marker);
    rebound(map);

    var viapoint=document.getElementById('via-input');
    viapoint.value=null;

  });
  console.log("AutocompleteDirectionsHandler終わり");
}

function appendClipHtml(place) {
  var label_element=document.createElement("label") ;
  var txt=document.createTextNode(place.name);
  label_element.innerHTML="<input type='checkbox' name='checkbox01' class='checkbox01-input' value='"+place.formatted_address+"' checked><span class='checkbox01-parts'>"+place.name+"</span><br>";
  var parent_object = document.getElementById("waypoints");
  parent_object.appendChild(label_element);
}

function createMarker(map, place) {
  // Create a marker for each place.
  var marker=new google.maps.Marker({
    map: map,
    // icon: icon,
    title: place.name,
    position: place.geometry.location
  });
  //info window
  var infowin = new google.maps.InfoWindow({content:place.name+" <i id="+place.name+" class='fas fa-check'></i>"});
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
      if($(".checkbox01-input[value='"+place.formatted_address+"']").prop("checked")){
          $(".checkbox01-input[value='"+place.formatted_address+"']").prop("checked",false);
          $("#"+place.name+"").hide();
      }else{
          $(".checkbox01-input[value='"+place.formatted_address+"']").prop("checked",true);
          $("#"+place.name+"").show();
      };
  });
  return marker;
}

function createPointMarker(map, place, mode) {
  // Create a marker for each place.
  var marker=new google.maps.Marker({
    map: map,
    // icon: icon,
    title: place.name,
    position: place.geometry.location
  });
  //info window
  var infowin;
  if (mode === 'ORIG') {
    infowin = new google.maps.InfoWindow({content:"出発："+place.name});
  } else {
    infowin = new google.maps.InfoWindow({content:"到着："+place.name});
  };
  // mouseoverイベントを取得するListenerを追加
  google.maps.event.addListener(marker, 'mouseover', function(){
      infowin.open(map, marker);
  });
  // mouseoutイベントを取得するListenerを追加
  google.maps.event.addListener(marker, 'mouseout', function(){
      infowin.close();
  });
  return marker;
}

function rebound(map) {
  if (markers.length === 0) {
    return;
  }
  // 範囲内に収める
  var minX = markers[0].getPosition().lng();
  var minY = markers[0].getPosition().lat();
  var maxX = markers[0].getPosition().lng();
  var maxY = markers[0].getPosition().lat();
  for(var i=0; i<markers.length; i++){
      var lt = markers[i].getPosition().lat();
      var lg = markers[i].getPosition().lng();
      if (lg <= minX){ minX = lg; }
      if (lg > maxX){ maxX = lg; }
      if (lt <= minY){ minY = lt; }
      if (lt > maxY){ maxY = lt; }
  }
  var sw = new google.maps.LatLng(maxY, minX);
  var ne = new google.maps.LatLng(minY, maxX);
  var bounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(bounds);
}


// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.ラジオボタン
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
  var radioButton = document.getElementById(id);
  var me = this;
  radioButton.addEventListener('click', function () {
    travelMode = mode;
    // me.route();
  });
  console.log("setupClickListener終わり");
};

//出発・到着地を変更した時
AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (map, autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', me.map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    console.log(place);

    var marker = createPointMarker(me.map, place, mode);

    markers.push(marker);
    rebound(map);

    if (mode === 'ORIG') {
      originPlaceId = place.place_id;
    } else {
      destinationPlaceId = place.place_id;
    };
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
    origin: { 'placeId': originPlaceId },
    destination: { 'placeId': destinationPlaceId },
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
      var sumDis=0;
      var sumTim=0;
      for(var i=0 ; i<route.legs.length ; i++){
        sumDis += Number(route.legs[i].distance.value);
        sumTim += Number(route.legs[i].duration.value);
      }
      summaryPanel.innerHTML = '<br><hr>' + '<h4>距離：'+ sumDis + ' m </h4>' +'<h4>時間：'+ sumTim + ' 秒 </h4><hr>';
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

function postClip(placeId) {
  return $.ajax({
    type: 'post',
    url: "/clip/" + user,
    data: JSON.stringify({ 'id': placeId }),
    contentType: 'application/JSON',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    success: function (data) {
      // Success
      console.log("success clip");
    },
    error: function (data) {
      // Error
      console.error("error post clip");
    }
  });
}
