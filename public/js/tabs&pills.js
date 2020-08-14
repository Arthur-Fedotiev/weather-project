//jshint esversion:6

$(document).ready(function() {

  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position, options) {
      console.log(position.coords);
      $("#latitude").val(position.coords.latitude);
      $("#longitude").val(position.coords.longitude);
      
    });
  }
});
