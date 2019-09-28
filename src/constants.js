export default {
	NJ_BOUNDS: {'north': 41.61, 'east': -73.40, 'south': 39.61, 'west': -76.10},
	NJ_CENTER: [40.07, -74.56],
	API_BASE_URL: 'http://127.0.0.1:8000/',
	API_PATH: 'articles/',
	MAP_ZOOM_LEVEL: 7,
//	MAP_TILE_LAYER: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
	MAP_TILE_LAYER: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
//	MAP_TILE_ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	MAP_TILE_ATTRIBUTION: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
	MAP_FEATURE_COLOR_PRIMARY: '#00589c',
	MAP_FEATURE_COLOR_SECONDARY: '#ff9e0f',
	MAP_POINT_MARKER_OPTIONS: {
		radius: 8,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	},
	STATIC_BASE_URL: 'https://interpretation-of-nj.s3.us-east-2.amazonaws.com/',
	DATE_FORMAT: { month: 'long', day: 'numeric', year: 'numeric' },
	NULL_GEOJSON_FEATURE: {
		"type": "Feature",
		"properties": {
			"name": null,
			"category": null
		},
		"geometry": {
			"type": null,
			"coordinates": null
		}
	}
}