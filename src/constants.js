export default {
	NJ_BOUNDS: {'north': 41.61, 'east': -73.40, 'south': 39.61, 'west': -76.10},
	NJ_CENTER: [40.07, -74.56],
	API_BASE_URL: 
	'https://inj-rest-production.herokuapp.com/',
	//'https://inj-rest-staging.herokuapp.com/',
	//'http://127.0.0.1:8000/',
	API_PATH: 'articles/',
	API_LOGIN_PATH: 'api-token-auth/',
	MAP_DEFAULT_OPTIONS: {
		center: [40.17, -74.70],
		// slightly north of the state's center, for the sake of the home page map
		zoom: 9,
		maxZoom: 15,
		scrollWheelZoom: false
	},
	MAP_ZOOM_LEVEL: 8,
	MAP_MAX_ZOOM: 15,
	MAP_BOUNDS_PADDING: [50, 50],
	MAP_TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
	MAP_TILE_2_LAYER: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
	MAP_TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	MAP_TILE_2_ATTRIBUTION: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS...and the GIS User Community',
	// removed " NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), "
	MAP_POINT_MARKER_OPTIONS: {
		radius: 4,
	},
	MAP_DEFAULT_FEATURE_CATEGORY: 15,
	MAP_PATTERNED_FEATURE_CATEGORIES: [1],
	MAP_FEATURE_CLASS_NAMES: [
	// these are ordered by the pk of the geo categories. Not the best way I know
		'zero',
		'inj-map-feature__pyhsiographic-region',
		'inj-map-feature__other-landform',
		'inj-map-feature__mountain',
		'inj-map-feature__swamp',
		'inj-map-feature__other-political-entity',
		'inj-map-feature__city',
		'inj-map-feature__river-smaller',
		'inj-map-feature__lake-bay',
		'inj-map-feature__waterfall',
		'inj-map-feature__other-infrastructure',
		'inj-map-feature__road-major-highway',
		'inj-map-feature__road-local',
		'inj-map-feature__bridge-tunnel',
		'inj-map-feature__point-of-interest',
		'inj-map-feature__default',
		'inj-map-feature__town',
		'seventeen is missing',
		'inj-map-feature__river-major',
		'inj-map-feature__road-secondary-highway',
		'inj-map-feature__mountain-range'
	],
	STATIC_BASE_URL: 'https://interpretation-of-nj.s3.us-east-2.amazonaws.com/',
	DATE_FORMAT: { month: 'long', day: 'numeric', year: 'numeric' },
	NULL_GEOJSON_FEATURE: {
		"type": "Feature",
		"properties": {
			"name": null,
			"category": null
		},
		"geometry": {
			"type": "",
			"coordinates": ""
		}
	},
	FEATURED_ARTICLE_LENGTH: 500,
	TOOLBAR_DRAW_OPTIONS: {
		'draw': {
			'rectangle': false,
			'circle': false,
			'circlemarker': false,
			'polyline': {
				'icon': false,
			}
		},
		'position': 'topright'
	},
	TOOLBAR_EDIT_OPTIONS: {
		'draw': false,
		'edit': {
			'featureGroup': null,
			'remove': false
		},
		'position': 'topright'
	},
	PLEASE_LOG_IN: 'Please log in or create an account',
	NO_CONTRIBUTOR_ARTICLES: 'There are no articles associated with this contributor.',
	NO_CONTRIBUTOR_COMMENTARY: 'There is no commentary associated with this contributor.',
	LOG_IN_TO_COMMENT: 'To comment, please log in or create an account. '
}