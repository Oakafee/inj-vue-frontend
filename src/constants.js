export default {
	NJ_BOUNDS: {'north': 41.61, 'east': -73.40, 'south': 39.61, 'west': -76.10},
	NJ_CENTER: [40.07, -74.56],
	API_BASE_URL: 'http://127.0.0.1:8000/',
	API_PATH: 'articles/',
	MAP_ZOOM_LEVEL: 7,
	MAP_MAX_ZOOM: 15,
//	MAP_TILE_LAYER: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
	MAP_TILE_LAYER: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
//	MAP_TILE_ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	MAP_TILE_ATTRIBUTION: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
	MAP_FEATURE_COLOR_PRIMARY: '#00589c',
	MAP_FEATURE_COLOR_SECONDARY: '#ff9e0f',
	MAP_LINE_WEIGHT: 6,
	MAP_POINT_MARKER_OPTIONS: {
		radius: 4,
		fillColor: '#00589c',
		color: '#00589c',
		weight: 3,
		opacity: 1,
		fillOpacity: 0.5
	},
	MAP_DEFAULT_FEATURE_CATEGORY: 15,
	MAP_FEATURE_CLASS_NAMES: [
		'zero',
		'inj-map-feature__pyhsiographic-region',
		'inj-map-feature__other-landform',
		'inj-map-feature__mountain',
		'inj-map-feature__swamp',
		'inj-map-feature__other-political-entity',
		'inj-map-feature__city-town',
		'inj-map-feature__river',
		'inj-map-feature__lake-bay',
		'inj-map-feature__waterfill',
		'inj-map-feature__other-infrastructure',
		'inj-map-feature__highway',
		'inj-map-feature__local-road',
		'inj-map-feature__bridge-tunnel',
		'inj-map-feature__point-of-interest',
		'inj-map-feature__default'
	],
	STATIC_BASE_URL: 'https://interpretation-of-nj.s3.us-east-2.amazonaws.com/',
	DATE_FORMAT: { month: 'long', day: 'numeric', year: 'numeric' },
	NULL_GEOJSON_FEATURE: {
		"type": "Feature",
		"properties": {
			"name": '',
			"category": null
		},
		"geometry": {
			"type": '',
			"coordinates": ''
		}
	},
	
}