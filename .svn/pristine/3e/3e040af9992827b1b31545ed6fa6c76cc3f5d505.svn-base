function initialize() {
  // Setup Leaflet 
  //var map = L.map('map_canvas').setView([17.7850, -12.4183], 2);
  var mapLayer = MQ.mapLayer();
  var map = L.map('map_canvas', {
                layers: mapLayer,
                center: [ 17.7850, -12.4183 ],
                zoom: 2
            });
  L.control.layers({
      'Map': mapLayer,
      'Satellite': MQ.satelliteLayer(),
      'Hybrid': MQ.hybridLayer()
  }).addTo(map);
  // declar a heat map
  var addressPoints1 = addressPoints;
  var heat = L.heatLayer(addressPoints1,{
          radius: 25,
          blur: 16,
          maxZoom: 17,
          gradient: {0.2: '#0000FF', 0.4: 'lime', 0.7: 'red'}
      }).addTo(map);

  if(io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect('/');

    // This listens on the "twitter-steam" channel and data is 
    // received everytime a new tweet is receieved.
    socket.on('twitter-stream', function (data) {
      //heat.addLatLng([data.lng, data.lat]);
      addressPoints1.push([data.lng, data.lat, 2]);
      var circle = L.circle([data.lng, data.lat], 500, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3
      }).addTo(map);

      setTimeout(function(){
        map.removeLayer(circle);
      },600);

    });

    // Listens for a success response from the server to 
    socket.on("connected", function(r) {
      socket.emit("start tweets");
    });
    // This listens on the "twitter-trending" channel and data is received everytime a new tweet is receieved.
    socket.on('twitter-trending', function (data) {
      var json = JSON.parse(data);
      //var trendsData = data[0];
      if(json != null && json[0] != null){
        if(json[0].trends && (json[0].trends).length >=9){

          var outputHTML = "";
          for(var i=0; i<10; i++){
              outputHTML = outputHTML + "<li><a href=\'" + json[0].trends[i].url + "\' target=\'_blank\'>" + json[0].trends[i].name + "</li>";
          }
          outputHTML = outputHTML + "</ul>";
        } else if(json[0].trends && (json[0].trends).length <9){
            var outputHTML = "<ul>";
            for(var i=0; i<(json[0].trends).length; i++){
                outputHTML = outputHTML + "<li><a href=\'" + json[0].trends[i].url + "\' target=\'_blank\'>" + json[0].trends[i].name + "</li>";
            }
        }
        $('#trending_wrld').html(outputHTML);
      }
    });
    // This listens on the "twitter-trending" channel and data is received everytime a new tweet is receieved.
    socket.on('caesars-trending', function (data) {
      var json = JSON.parse(data);
      console.log(json);
      //var trendsData = data[0];
      if(json != null && json[0] != null){
        if(json[0].trends && (json[0].trends).length >=9){

          var outputHTML = "";
          for(var i=0; i<10; i++){
              outputHTML = outputHTML + "<li><a href=\'" + json[0].trends[i].url + "\' target=\'_blank\'>" + json[0].trends[i].name + "</li>";
          }
          outputHTML = outputHTML + "</ul>";
        } else if(json[0].trends && (json[0].trends).length <9){
            var outputHTML = "<ul>";
            for(var i=0; i<(json[0].trends).length; i++){
                outputHTML = outputHTML + "<li><a href=\'" + json[0].trends[i].url + "\' target=\'_blank\'>" + json[0].trends[i].name + "</li>";
            }
        }
        $('#trending_lv').html(outputHTML);
      }
    });

      setInterval(function(){
        heat.setLatLngs(addressPoints1);
        addressPoints1=[];
      },30000);

  }
}