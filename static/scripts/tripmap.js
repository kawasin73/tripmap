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

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

var localData = {
  ids: [],
  set: function (place) {
    localStorage.setItem(place.place_id, JSON.stringify(place));
    this.ids.push(place.place_id);
    localStorage.setItem("clips", JSON.stringify(this.ids));
  },
  del: function (place) {
    this.ids.remove(place.place_id);
    localStorage.setItem("clips", JSON.stringify(this.ids));
    localStorage.removeItem(place.place_id);
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
var markers = {};

function AutocompleteDirectionsHandler(map) {
  this.map = map;
  localData.setup(map);
  localData.getAll().forEach(function (place) {
    appendClipHtml(place);
    var marker = createMarker(map, place);
    markers[place.place_id] = marker;
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

  // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  $('#all-places').click(function () {
    $('#all-places').hide();
    $('#my-places').show();
    $('#all-place-board').show();
    $('#clipboard').hide();

    getPlaces(map).done(function (data) {
      console.log("get places", data);
    });
  });

  $('#my-places').click(function () {
    $('#all-places').show();
    $('#my-places').hide();
    $('#all-place-board').hide();
    $('#clipboard').show();
  });


//中継地点変更した時
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }

    var place = places[0];

    var viapoint=document.getElementById('via-input');
    viapoint.value=null;

    // check already cliped
    if (!!markers[place.place_id]) {
      return
    }

    console.log(place.name);

    // For each place, get the icon, name and location.
    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }

    postClip(place.place_id);
    localData.set(place);

    //クリップボードに表示
    appendClipHtml(place);

    var marker = createMarker(map, place);
    markers[place.place_id] = marker;
    rebound(map);
  });
  console.log("AutocompleteDirectionsHandler終わり");
}

function appendClipHtml(place) {
  //クリップボードに表示
  var label_element=document.createElement("label");
  label_element.setAttribute('id', place.place_id+"label");
  label_element.setAttribute('class', 'label');

  var checkbox = document.createElement('input');
  checkbox.setAttribute('id', 'input-' + place.place_id);
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('name', place.place_id);
  checkbox.setAttribute('class', 'checkbox01-input');
  checkbox.setAttribute('value', place.formatted_address);
  checkbox.setAttribute('checked', 'checked');
  checkbox.onclick = function (e) {
    onClickCheckbox(place, e.target);
  };
  label_element.appendChild(checkbox);

  var text = document.createElement('span');
  text.setAttribute('class', 'checkbox01-parts');
  text.appendChild(document.createTextNode(place.name));
  label_element.appendChild(text);

  var deleteButton = document.createElement('button');
  deleteButton.setAttribute('id', 'button-' + place.place_id);
  deleteButton.setAttribute('value', place.name);
  deleteButton.appendChild(document.createTextNode('削除'));
  deleteButton.onclick = function (e) {
    removeClip(place);
  };
  label_element.appendChild(deleteButton);

  label_element.appendChild(document.createElement('br'));

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
  var infowin = new google.maps.InfoWindow({content:place.name+" <i id=\"info-"+place.place_id+"\" class='fas fa-check'></i>"});
  // mouseoverイベントを取得するListenerを追加
  google.maps.event.addListener(marker, 'mouseover', function(){
      infowin.open(map, marker);
  });
  // mouseoutイベントを取得するListenerを追加
  google.maps.event.addListener(marker, 'mouseout', function(){
      infowin.close();
  });
  //click checkbox
  google.maps.event.addListener(marker, 'click', function(){
    var checkbox = $("#input-"+place.place_id);
      if(checkbox.prop("checked")){
          checkbox.prop("checked",false);
          $("#info-"+place.place_id+"").hide();
      }else{
          checkbox.prop("checked",true);
          $("#info-"+place.place_id+"").show();
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
  var markerList = Object.values(markers);
  if (markerList.length === 0) {
    return;
  }
  // 範囲内に収める
  var minX = markerList[0].getPosition().lng();
  var minY = markerList[0].getPosition().lat();
  var maxX = markerList[0].getPosition().lng();
  var maxY = markerList[0].getPosition().lat();
  for(var i=0; i<markerList.length; i++){
      var lt = markerList[i].getPosition().lat();
      var lg = markerList[i].getPosition().lng();
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

    markers[place.place_id] = marker;
    rebound(map);

    if (mode === 'ORIG') {
      originPlaceId = place.place_id;
    } else {
      destinationPlaceId = place.place_id;
    };
  });
  console.log("setupPlaceChangedListener終わり");
};

//秒　→　時分
function toHms(t) {
	var hms = "";
	var h = t / 3600 | 0;
	var m = t % 3600 / 60 | 0;
	var s = t % 60;
	if (h != 0) {
		hms = h + "時間" + padZero(m) + "分" ;
    // + padZero(s) + "秒";
	} else if (m != 0) {
		hms = m + "分" ;
    // + padZero(s) + "秒";
	} else {
		hms = s + "秒";
	}
	return hms;
	function padZero(v) {
		if (v < 10) {
			return "0" + v;
		} else {
			return v;
		}
	}
}


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
      var sumDis=0;
      var sumTim=0;
      for(var i=0 ; i<route.legs.length ; i++){
        sumDis += Number(route.legs[i].distance.value);
        sumTim += Number(route.legs[i].duration.value);
      }
      sumDis = (sumDis/1000);
      sumTim = toHms(sumTim);
      var parent_object = document.getElementById('directions-panel');
      var summaryPanel=document.createElement("div");
      $(summaryPanel).attr('class', 'summaryPanelStyle');
      summaryPanel.innerHTML = '<h4><font>合計距離：</font>'+ sumDis + ' km </h4>' +'<h4><font>合計時間：</font>'+ sumTim + ' </h4>';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<hr><b><font>区間: ' + routeSegment +
          '</font></b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + '<br><font> to </font><br>';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += '<h4><font>距離：</font>'+route.legs[i].distance.text +"       "+ '<font>時間：</font>'+route.legs[i].duration.text + '</h4>';
      }
      parent_object.appendChild(summaryPanel);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

//中継地点の文字をクリック→infoboxをcheck/uncheck
function onClickCheckbox(place, checkbox){
    // var matchMarker = markers.filter(function(item, index){
    //   if (item.title == check.name) return true;
    // });
  if (checkbox.checked) {
    console.log("show");
    $("#info-"+place.place_id+"").show();
  } else {
    console.log("hide");
    $("#info-"+place.place_id+"").hide();
  }
}

//markerを削除,clipboardからも削除　→　rebounds
function removeClip(place) {
  localData.del(place);
  $("#" + place.place_id + "label").remove();
  var marker = markers[place.place_id];
  if (!marker) {
    return
  }
  marker.setMap(null);
  delete markers[place.place_id];
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

function getPlaces(map) {
  var center = map.getCenter();
  return $.getJSON("/places?lat="+center.lat().toString()+"&lng="+center.lng().toString(), {format: "json"})
}
