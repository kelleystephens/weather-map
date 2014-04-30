/* global google:true */
/* jshint unused:false, camelcase:false */
/* global AmCharts:true */
/* global _:true */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36, -86, 3);
    $('#add').click(add);
  }

  var map;
  var charts = {};

  function initMap(lat, lng, zoom){
    let styles = [{'elementType':'labels.text.stroke','stylers':[{'color':'#ffffff'}]},{'elementType':'labels.text.fill','stylers':[{'color':'#000000'}]},{'featureType':'water','elementType':'geometry','stylers':[{'color':'#0000ff'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#ff0000'}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#000100'}]},{'featureType':'road.highway.controlled_access','elementType':'geometry.fill','stylers':[{'color':'#ffff00'}]},{'featureType':'road.highway.controlled_access','elementType':'geometry.stroke','stylers':[{'color':'#ff0000'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#ffa91a'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#000000'}]},{'featureType':'landscape.natural','stylers':[{'saturation':36},{'gamma':0.55}]},{'featureType':'road.local','elementType':'geometry.stroke','stylers':[{'color':'#000000'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#ffffff'}]},{'featureType':'landscape.man_made','elementType':'geometry.stroke','stylers':[{'lightness':-100},{'weight':2.1}]},{'featureType':'landscape.man_made','elementType':'geometry.fill','stylers':[{'invert_lightness':true},{'hue':'#ff0000'},{'gamma':3.02},{'lightness':20},{'saturation':40}]},{'featureType':'poi.attraction','stylers':[{'saturation':100},{'hue':'#ff00ee'},{'lightness':-13}]},{'featureType':'poi.government','stylers':[{'saturation':100},{'hue':'#eeff00'},{'gamma':0.67},{'lightness':-26}]},{'featureType':'poi.medical','elementType':'geometry.fill','stylers':[{'hue':'#ff0000'},{'saturation':100},{'lightness':-37}]},{'featureType':'poi.medical','elementType':'labels.text.fill','stylers':[{'color':'#ff0000'}]},{'featureType':'poi.school','stylers':[{'hue':'#ff7700'},{'saturation':97},{'lightness':-41}]},{'featureType':'poi.sports_complex','stylers':[{'saturation':100},{'hue':'#00ffb3'},{'lightness':-71}]},{'featureType':'poi.park','stylers':[{'saturation':84},{'lightness':-57},{'hue':'#a1ff00'}]},{'featureType':'transit.station.airport','elementType':'geometry.fill','stylers':[{'gamma':0.11}]},{'featureType':'transit.station','elementType':'labels.text.stroke','stylers':[{'color':'#ffc35e'}]},{'featureType':'transit.line','elementType':'geometry','stylers':[{'lightness':-100}]},{'featureType':'administrative','stylers':[{'saturation':100},{'gamma':0.35},{'lightness':20}]},{'featureType':'poi.business','elementType':'geometry.fill','stylers':[{'saturation':-100},{'gamma':0.35}]},{'featureType':'poi.business','elementType':'labels.text.stroke','stylers':[{'color':'#69ffff'}]},{'featureType':'poi.place_of_worship','elementType':'labels.text.stroke','stylers':[{'color':'#c3ffc3'}]}];
    let mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles: styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);

    var weatherLayer = new google.maps.weather.WeatherLayer({
      temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
      });
      weatherLayer.setMap(map);
    }

  function add(){
    let zip = $('#zip').val().trim();
    geocode(zip);
    getWeather(zip);
    $('#zip').val('');
    $('#zip').focus();
  }

  function geocode(zip){
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: zip}, (results, status)=>{
      let name = results[0].formatted_address;
      let lat = results[0].geometry.location.lat();
      let lng = results[0].geometry.location.lng();
      addMarker(lat, lng, name, './media/flag.png');
      let latLng = new google.maps.LatLng(lat, lng);
      map.setCenter(latLng);
      map.setZoom(5);
    });
  }

  function addMarker(lat, lng, name, icon){
    let latLng = new google.maps.LatLng(lat, lng);
    new google.maps.Marker({map: map, position: latLng, title: name, icon: icon});
  }

  function getWeather(zip){
    let url = `http://api.wunderground.com/api/4044d317dac8e37e/forecast10day/q/${zip}.json?callback=?`;
    $.getJSON(url, data=>{
    $('#graphs').append(`<div class=graph data-zip=${zip}></div>`);
    makeChart(zip);
    data.forecast.simpleforecast.forecastday.forEach(f=>charts[zip].dataProvider.push({date: `${f.date.month}/${f.date.day}`, high: f.high.fahrenheit, low: f.low.fahrenheit}));
    charts[zip].validateData();
  });
  }

  function makeChart(zip){
    let graph = $(`.graph[data-zip=${zip}]`)[0];
    charts[zip] = AmCharts.makeChart(graph, {
      'type': 'serial',
      'theme': 'dark',
      'titles': [{
        'text': `${zip}`,
        'size': 15
    }],
      'pathToImages': 'http://www.amcharts.com/lib/3/images/',
      'legend': {
        'useGraphSettings': true
      },
    'dataProvider': [],
    'valueAxes': [{
        'id':'v1',
        'axisColor': '#FF6600',
        'axisThickness': 2,
        'gridAlpha': 0,
        'axisAlpha': 1,
        'position': 'left'
    }],
    'graphs': [{
        'valueAxis': 'v1',
        'lineColor': '#FF6600',
        'bullet': 'round',
        'bulletBorderThickness': 1,
        'hideBulletsCount': 30,
        'title': 'High',
        'valueField': 'high',
		'fillAlphas': 0
    }, {
        'valueAxis': 'v1',
        'lineColor': '#FCD202',
        'bullet': 'square',
        'bulletBorderThickness': 1,
        'hideBulletsCount': 30,
        'title': 'Low',
        'valueField': 'low',
		'fillAlphas': 0
    }],
    'chartCursor': {
        'cursorPosition': 'mouse'
    },
    'categoryField': 'date',
    'categoryAxis': {
        'labelRotation': 30,
        'axisColor': '#DADADA',
        'minorGridEnabled': true
      }
    });
  }
})();
