<template>
	<div>
		<div class="inj-article-map-container" :class="{ 'inj-article-map-hidden' : mapHidden }">
			<div id="articleMap"></div>
		</div>
		<div class="inj-article-map__edit" :class="{ 'inj-article-map__edit--hidden' : !editable }" v-if="editPermission">
			<span v-if="mapHidden">Add a map feature: </span>
			<button @click="drawNewFeature = true">Draw map feature </button> or
			<button @click="toggleModal(true)">Paste data </button>
			{{ drawNewFeature }}
		</div>
				
		<InjModal v-if="pasteDataModalOpen">
			<h3>Add map feature data </h3>
			<div class="paste-data__option">
				<input type="radio" v-model="pasteDataType" id="coordinates" value="coordinates" />
				<label for="coordinates">Coordinates: 
					<div class="paste-data__input">
						<input type="text" class="inj-text-input" v-model="nCoord" @focus="pasteDataType = 'coordinates'" /> N,
						<input type="text" class="inj-text-input" v-model="wCoord" @focus="pasteDataType = 'coordinates'" /> W
					</div>
				</label>
			</div>
			<div class="paste-data__option">
				<input type="radio" v-model="pasteDataType" id="geoJson" value="geoJson">
				<label for="geoJson">GeoJSON feature: <small>Or looks for the first feature in a feature collection </small>
					<textarea class="inj-textarea paste-data__input paste-data__geojson" v-model="geoJson" @focus="pasteDataType = 'geoJson'" />
				</label>
			</div>
			<p class="inj-text-error" v-if="validationError">{{ validationError }} </p>
			<button class="inj-button inj-button-secondary" @click="cancelPasteData()">Cancel</button>
			<button class="inj-button" :class="{ 'inj-button-error' : validationError }" @click="addPastedFeature()">Add</button>
		</InjModal>
	</div>
</template>

<script>
import L from 'leaflet';
import 'leaflet-draw';
import {mapState} from 'vuex';
import GJV from 'geojson-validation';

import store from '../store';
import constants from '../constants';
import InjModal from './InjModal';

export default {
	name: 'ArticleMap',
	components: { InjModal },
	props: ['editable'],
	data: function () {
		return {
			map: '',
			mapFeatureLayer: {},
			mapDrawToolbar: {},
			pasteDataModalOpen: false,
			pasteDataType: null,
			wCoord: null,
			nCoord: null,
			geoJson: null,
			validationError: null,
			drawNewFeature: false,
		}
	},
	computed: {
		...mapState({
			feature: 'articleMapFeature',
			newMapFeature: 'newMapFeature',
			editPermission: 'editPermission',
		}),
		mapHidden() {
			if (this.feature.geometry || this.newMapFeature.geometry || this.drawNewFeature) {
				return false;
			}
			return true;
		},
    },
	mounted() {
		/*
		these are proving troublesome for now, affecting how features are centered on the map, so I'm not sure if they're worth it
		let stateBounds = [[constants.NJ_BOUNDS.north, constants.NJ_BOUNDS.east],
			[constants.NJ_BOUNDS.south, constants.NJ_BOUNDS.west]];
		*/
		
		this.map = L.map('articleMap', { 
			scrollWheelZoom: false
		 }).setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);//.setMaxBounds(stateBounds);

		L.tileLayer(constants.MAP_TILE_LAYER, {
			attribution: constants.MAP_TILE_ATTRIBUTION
		}).addTo(this.map);
		
		this.addFeatureToMap(this.feature);
	},
	watch: {
		feature() {
			this.removeCurrentFeature();
			this.addFeatureToMap(this.feature);
		},
		newMapFeature() {
			this.removeCurrentFeature();
			if (this.newMapFeature.geometry) {
				this.addFeatureToMap(this.newMapFeature)	
			} else if (this.feature.geometry) {
				this.addFeatureToMap(this.feature)
			}
		},
		editable() {
			if(this.mapFeatureLayer.options) {
				if(this.editable) {
					this.initializeMapDrawing();
				} else {
					this.mapDrawToolbar.remove();
				}
			}
			this.drawNewFeature = false;
		},
	},
	methods: {
		addFeatureToMap(feature) {
			if (feature.geometry) {
				this.mapFeatureLayer = L.geoJSON(feature, {
					style: { 'color': constants.MAP_FEATURE_COLOR_PRIMARY },
					onEachFeature: function(feature, layer) {
						layer.bindPopup(feature.properties.name);
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
					}
				}).addTo(this.map);
				this.map.fitBounds(this.mapFeatureLayer.getBounds());
				console.log('map feature layer', this.mapFeatureLayer);
			}		
		},
		removeCurrentFeature() {
			if (this.map.hasLayer(this.mapFeatureLayer)) {
				this.mapFeatureLayer.remove();
				this.map.setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);
			}		
		},
		initializeMapDrawing() {
				if (!this.mapFeatureLayer) {
					this.mapFeatureLayer = new L.FeatureGroup();
   					this.map.addLayer(this.mapFeatureLayer);	
				}
				let toolbarOptions = {
					'edit': {
						'featureGroup': this.mapFeatureLayer
					},
					'position': 'topright'
				};
				function commitLayerChange(layer) {
					store.commit('addNewMapFeature', layer.toGeoJSON());
				}
				this.mapDrawToolbar = new L.Control.Draw(toolbarOptions);
				this.map.addControl(this.mapDrawToolbar);
				this.map.on('draw:created', (e) => commitLayerChange(e.layer));
				this.map.on('draw:edited', (e) => {
					e.layers.eachLayer((layer) => commitLayerChange(layer));
				});
				this.map.on('draw:deleted', (e) => {
					// deleting is going to need some work. not working now
					store.commit('addNewMapFeature', {});
				});
		},
		toggleModal(status) {
			this.pasteDataModalOpen = status;
		},
		addPastedFeature() {
			let newFeature = {};
			if (this.pasteDataType === 'coordinates') {
				newFeature = {
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": null,
					},
					"properties": {
						"name": null,
						"category": null
					}
				};
				let n = parseFloat(this.nCoord);
				let w = parseFloat(this.wCoord);
				if (this.pointCoordsAreNumbers(n,w) && this.pointCoordsAreInBounds(n,w)) {
					newFeature.geometry.coordinates = [w, n];
				} else return;
			} else if (this.pasteDataType === 'geoJson') {
				/* GeoJSON validation
				TODO:
				- Could break this up into different functions?
				- Should also validate to make sure it's geographically inside NJ
				*/
				try	{
					newFeature = JSON.parse(this.geoJson);
				} catch(e) {
					this.validationError = 'Please make sure your feature is a valid JSON object';
					return;
				}
				if(!GJV.isGeoJSONObject(newFeature)) {
					this.validationError = 'Please make sure your feature is in valid GeoJSON format';
					return;
				}
				if (newFeature.type === 'FeatureCollection') {
					newFeature = newFeature.features[0]
					newFeature.type === "Feature";
				}
			} else {
				this.validationError = 'Please enter something';
				return;
			};
			store.commit('addNewMapFeature', newFeature);
			this.toggleModal(false);
		},
		// Validation functions:
		pointCoordsAreNumbers(n, w) {
			if (isNaN(n) || isNaN(w)) {
				this.validationError = 'Please make sure your coordinates are numbers';
				return false;
			} else return true;
		},
		pointCoordsAreInBounds(n, w) {
			if(
				n > constants.NJ_BOUNDS.north ||
				n < constants.NJ_BOUNDS.south ||
				w > constants.NJ_BOUNDS.east ||
				w < constants.NJ_BOUNDS.west
			) {
				this.validationError = 'Please make sure your coordinates are located inside New Jersey';
				return false;
			} else return true;
		},
		cancelPasteData() {
			this.toggleModal(false);
			this.pasteDataType = null;
			this.nCoord = null;
			this.wCoord = null;
			this.geoJson = {};
			this.validationError = null;
		}
	}
}
</script>

<style lang="scss">
@import '../../node_modules/leaflet/dist/leaflet.css';
@import '../../node_modules/leaflet-draw/dist/leaflet.draw.css';
@import '../settings.scss';


#articleMap {
	width: calc(100% - 2*$spacing);
	height: 290px;
	border: 1px solid black;
}

.inj-article-map-container.inj-article-map-hidden {
	height: 0;
	visibility: hidden;
}

.inj-article-map__edit {
	opacity: 1;
	transition: opacity $transition-time;
	&--hidden {
		pointer-events: none;
		opacity: 0;
	}
}

.paste-data {
	&__option {
		padding-bottom: $spacing;
	}
	&__input {
		padding-top: $spacing / 2;
		input {
			width: 100px;
			display: inline;		
		}
	}
	&__textarea {
		width: 260px;
		height: 50px;
	}
}

</style>