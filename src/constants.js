export default {
	NJ_BOUNDS: {'north': 41.41, 'east': -73.60, 'south': 39.81, 'west': -75.90},
	NJ_CENTER: [40.07, -74.56],
	API_BASE_URL: 'http://127.0.0.1:8000/',
	API_PATH: 'articles/',
	MAP_ZOOM_LEVEL: 7,
	MAP_TILE_LAYER: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
	MAP_TILE_ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
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
}