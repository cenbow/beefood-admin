const configVar = {
  page: 1,
  pagesize: 25,
  mapConfig: {
    accessToken: 'pk.eyJ1Ijoiemhhb3dwIiwiYSI6ImNqd2E4YjN0bTAyaGI0YW40NG4xeWZyM2kifQ.mfTOmGdDvy_TXp9Edtmkww',
    tiles: 'http://192.168.1.231:8899/maps/osm/{z}/{x}/{y}.vector.pbf',
    addLayer: {
      "id": "road",
      "source": "osm",
      "source-layer": "road",
      "type": "line",
      "paint": {
        "line-color": "#FF0000",
        "line-width": 1
      }
    },
    city_tile_source: {
      'type': 'vector',
      "tiles": [
        // "http://192.168.1.231:8899/maps/osm/{z}/{x}/{y}.vector.pbf",
        'http://tiles.cambeefood.com/geodata/map/{z}/{x}/{y}.pbf',
        "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      "maxzoom": 16,
    },
    addLayer_polygon: {
      'id': 'city_polygon_id',
      'type': 'fill',
      'source': 'city_tile_source',
      'source-layer': '柬埔寨',
      'paint': {
        "fill-color": "#00ffff",
        "fill-opacity": 0,
        "fill-outline-color": "#ff0000"
      }
    },
    addLayer_normal: {
      'id': 'city_normal_line_id',
      'type': 'line',
      'source': 'city_tile_source',
      'source-layer': '柬埔寨',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        "line-color": "#0000ff",
        "line-width": 2
      }
    },
    addLayer_select_line: {
      'id': 'city_select_line_id',
      'type': 'line',
      'source': 'city_tile_source',
      'source-layer': '柬埔寨',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        "line-color": "#ff0000",
        "line-width": 2
      },
      "filter": ["==", "OBJECTID", ""]
    },
  },
  google_api_key: 'AIzaSyA-O4N6PPe--NH0zTn4GRJb9GmsETsxIGk',
};
export default configVar;