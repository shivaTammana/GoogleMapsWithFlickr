(function(){
//To initialize google maps and create a map object
var myMap;
var markersArray = [];
function initialize() {
  var mapProp = {
    center:new google.maps.LatLng(12.972512, 77.625962),
    zoom:3,
    mapTypeControl:false,    
    streetViewControl:false,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  myMap=new google.maps.Map(document.getElementById("googleMap"), mapProp);
  var geocoder = new google.maps.Geocoder();

  document.getElementById("submit").addEventListener('click', function() {
    document.getElementById("result").innerHTML = "";
    geocodeAddress(geocoder, myMap);
  });
  document.getElementById("reset").addEventListener('click', function() {
    location.reload();
  });
}
google.maps.event.addDomListener(window, 'load', initialize);

//creating angularjs module
var app = angular.module("geoImageApp",[]);
var imageData = [];
app.controller("geoImageCtrl", function($scope,$http){
	$http.get("https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=d852252f50352ee6a6e0b74754bb07a6&has_geo=1&extras=geo&format=json&per_page=100&nojsoncallback=?")
    	.then(function(response) {
    		imageData = response.data.photos.photo;
    		//console.log(response.data.photos.photo);    		

    		plotImages(imageData);
    });
});

function plotImages(imageData)
{

    var lat,lon;
    for (var i = 0; i < imageData.length; i++) {    	   

		//Read in the lat and long of each photo and stores it in a variable.
        lat = imageData[i].latitude;
		lon = imageData[i].longitude;
		
		//Get the url for the image.
		var photoURL = 'http://farm' + imageData[i].farm + '.static.flickr.com/' + imageData[i].server + '/' + imageData[i].id + '_' + imageData[i].secret + '_m.jpg';		
		htmlString = '<img src="' + photoURL + '">';					
		var contentString = '<div id="content">' + htmlString + '</div>';

		//Create a new info window using the Google Maps API
		var infoWindow = new google.maps.InfoWindow();		

		//Create a new marker position using the Google Maps API.
		var myLatlngMarker = new google.maps.LatLng(lat,lon);

		//Create a new marker using the Google Maps API, and assigns the marker to the map created below.
		var marker = new google.maps.Marker({
			position: myLatlngMarker,
			map: myMap,
			title:"Photo"
		});
		markersArray.push(marker);
		//Uses the Google Maps API to add an event listener that triggers the info window to open if a marker is clicked.
		google.maps.event.addListener(marker, 'click', (function(marker,contentString) {
			return function() {				
				infoWindow.setContent(contentString);
				infoWindow.open(myMap,marker);
			}
		})(marker,contentString));		
    };
}


function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
		resultsMap.setCenter(results[0].geometry.location);
		var latitude = results[0].geometry.location.lat();
		var longitude = results[0].geometry.location.lng();
		console.log(results[0].geometry.location);		
		var url = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=d852252f50352ee6a6e0b74754bb07a6&has_geo=1&extras=geo&lat="+ latitude +"&lon="+ longitude +"&accuracy=11&radius=30&format=json&per_page=100&nojsoncallback=?" 
		$.get(url, function(response, status){
    		//console.log(response);
    		imageData = response.photos.photo;
    		//console.log(response.data.photos.photo);    		
    		clearOverlays();
    		//myMap.setZoom(12);
    		plotImages(imageData);
    	});
    }
    else {
    	clearOverlays();
      document.getElementById("result").innerHTML = "No images found!!!";
    }
  });
}
function clearOverlays() {
 while(markersArray.length) { markersArray.pop().setMap(null); }
  markersArray.length = 0;
}
})();