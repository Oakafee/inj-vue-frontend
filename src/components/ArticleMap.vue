<template>
	<div>	
		<div
			class="inj-article-map-container"
			:class="{
				'inj-article-map-hidden' : mapHidden,
				'inj-article-map--expanded': mapExpanded
			}"
			@dblclick.once="enableScrollWheelZoom"
		>
			<div id="articleMap"></div>
			
			<div
				class="inj-article-map__expand inj-fade-transition"
				v-if="!mapHidden"
			>
			<!-- TODO: update and maybe remove this map expanded feature -->
				<svg
					v-if="mapExpanded"
					@click="expandMap(false)"
					viewBox="0 0 24 24"
				>
					<polyline points="4 14 10 14 10 20"></polyline>
					<polyline points="20 10 14 10 14 4"></polyline>
					<line x1="14" y1="10" x2="21" y2="3"></line>
					<line x1="3" y1="21" x2="10" y2="14"></line>
				</svg>
				<svg
					v-else
					@click="expandMap(true)"
					viewBox="0 0 24 24"
				>
					<polyline points="15 3 21 3 21 9"></polyline>
					<polyline points="9 21 3 21 3 15"></polyline>
					<line x1="21" y1="3" x2="14" y2="10"></line>
					<line x1="3" y1="21" x2="10" y2="14"></line>
				</svg>
			</div>

		</div>
		
		<div class="inj-article-map__add inj-fade-transition" :class="{ 'inj-fade-transition--hidden' : !editable }" v-if="editPermission">
			<select class="inj-select" @input="selectGeoCategory">
				<option disabled :selected="!feature.properties">Add to map...</option>
				<option
					v-for="cat in geoCategories"
					:value="cat.pk"
					:key="cat.pk"
					:selected="feature.properties ? (cat.pk === feature.properties.category) : false"
				>{{ cat.name }}
				</option>
			</select>&nbsp;
			<button class="inj-button inj-button-small" @click="toggleModal(true)" v-if="!mapHidden">Paste data </button>
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
import functions from '../functions';
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
			selectedGeoCategory: null
		}
	},
	computed: {
		...mapState({
			feature: 'articleMapFeature',
			newMapFeature: 'newMapFeature',
			editPermission: 'editPermission',
			geoCategories: 'geoCategories',
			mapExpanded: 'articleMapExpanded'
		}),
		mapHidden() {
			// have to check if there's a feature and if it's a non-deleted feature. a deleted feature will have geometry but no coordinates
			if (
				(this.feature.geometry && this.feature.geometry.coordinates) ||
				(this.newMapFeature.geometry && this.newMapFeature.geometry.cooordinates) ||
				this.drawNewFeature
			) {
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
		if (this.geoCategories.length === 0) functions.getGeoCategories();
		// since we are loading (or reloading?) a new article afresh, we want to get rid of any previous edits.
		if(this.newMapFeature.geometry) {
			store.commit('addNewMapFeature', {});			
		}
		
		this.map = L.map('articleMap', constants.MAP_DEFAULT_OPTIONS);

		L.tileLayer(constants.MAP_TILE_2_LAYER, {
			attribution: constants.MAP_TILE_2_ATTRIBUTION
		}).addTo(this.map);
		
		if(this.feature.geometry && this.feature.geometry.coordinates) {
			this.addFeatureToMap(this.feature);
		}
	},
	destroyed() {
		if(this.newMapFeature.geometry) {
			store.commit('addNewMapFeature', {});			
		}
	},
	watch: {
		feature() {
			this.updateFeatureOnMap(this.feature);
			// cheap shortcut for on route change
			this.map.scrollWheelZoom.disable();
		},
		newMapFeature() {
			// if this is breaking things, I'm sorry, you'll have to look back at the github for how it was before
			this.updateFeatureOnMap(this.newMapFeature);
		},
		editable() {
			if(this.editable) {
				this.initializeMapDrawing();
			} else {
				this.mapDrawToolbar.remove();
				this.mapExpanded = false;
			}
			this.drawNewFeature = false;
		},
	},
	methods: {
		addFeatureToMap(feature) {
			if (feature.geometry && feature.geometry.coordinates) {
				let featureStyle = {
					'className': functions.getMapClassName(feature)
				};
				this.mapFeatureLayer = L.geoJSON(feature, {
					style: featureStyle,
					onEachFeature: (feature, layer) => {
						layer.bindPopup(feature.properties.name);
					},
					pointToLayer: (feature, latlng) => {
						return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
					}
				}).addTo(this.map);
				if(feature.properties.category) {
					this.selectedGeoCategory = feature.properties.category;
				} else {
					this.selectedGeoCategory = constants.MAP_DEFAULT_FEATURE_CATIGORY;
				}
				let bounds = this.mapFeatureLayer.getBounds();
				this.map.fitBounds(bounds, {padding: constants.MAP_BOUNDS_PADDING});
			}		
		},
		removeCurrentFeature() {
			if (this.map.hasLayer(this.mapFeatureLayer)) {
				this.mapFeatureLayer.remove();
				//this.map.setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);
			}		
		},
		updateFeatureOnMap(feature) {
			this.removeCurrentFeature();
			if(feature.geometry && feature.geometry.coordinates) {
				this.addFeatureToMap(feature)
			} else {
				this.map.setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);
			}
		},
		initializeMapDrawing() {
			if (!this.mapFeatureLayer.options) {
				this.mapFeatureLayer = new L.FeatureGroup();
					this.map.addLayer(this.mapFeatureLayer);
			}
			let toolbarOptions = {
				'edit': {
					'featureGroup': this.mapFeatureLayer,
				},
				'position': 'topright'
			};
			let self = this;
			function commitLayerChange(layer) {
				let jsonLayer = layer.toGeoJSON();
				jsonLayer.properties.category = self.selectedGeoCategory;
				store.commit('addNewMapFeature', jsonLayer);
				// add the style info somewhere around here
			}
			this.mapDrawToolbar = new L.Control.Draw(toolbarOptions);
			this.map.addControl(this.mapDrawToolbar);
			
			/*TODO change this condition, this isn't working
			if (!this.feature) {
				this.mapDrawToolbar.Delete.disable();
				this.mapDrawToolbar.Edit.disable();
			}
			*/
			
			this.map.on('draw:created', (e) => commitLayerChange(e.layer));
			this.map.on('draw:edited', (e) => {
				e.layers.eachLayer((layer) => commitLayerChange(layer));
			});
			this.map.on('draw:deleted', (e) => {
				e.layers.eachLayer(() => {
					store.commit('addNewMapFeature', {});
				});
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
			}
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
		},
		selectGeoCategory(event) {
			// there has to be a more concise way of doing this?
			this.selectedGeoCategory = parseInt(event.target.value);
			this.drawNewFeature = true;
			let updatedFeature = constants.NULL_GEOJSON_FEATURE;
			if (this.newMapFeature.geometry) {
				updatedFeature.properties.name = this.newMapFeature.properties.name;
				updatedFeature.geometry.type = this.newMapFeature.geometry.type;
				updatedFeature.geometry.coordinates = this.newMapFeature.geometry.coordinates;
			} else if (this.feature.geometry) {
				updatedFeature.properties.name = this.feature.properties.name;
				updatedFeature.geometry.type = this.feature.geometry.type;
				updatedFeature.geometry.coordinates = this.feature.geometry.coordinates;

			} else return; // it will be handled when you draw something
			updatedFeature.properties.category = this.selectedGeoCategory;
			store.commit('addNewMapFeature', updatedFeature);
		},
		enableScrollWheelZoom() {
			this.map.scrollWheelZoom.enable();
		},
		expandMap(expanded) {
			store.commit('toggleArticleMapSize', expanded);
			let self = this;
			setTimeout(function() {
				self.map.invalidateSize(true); //the true is for panning the map
			}, 600); // 0.6s is the css transition time
		}
	}
}
</script>

<style lang="scss">
@import '../../node_modules/leaflet/dist/leaflet.css';
@import '../../node_modules/leaflet-draw/dist/leaflet.draw.css';
@import '../settings.scss';


#articleMap {
	height: $map-height;
	border: 1px solid black;
	transition: height $transition-time;
}

.inj-article-map {

	&-container {
		visibility: visible;
		opacity: 1;
		margin-bottom: $spacing;
		width: 100%;
		transition-property: opacity, width;
		transition-duration: $transition-time;
		&.inj-article-map-hidden {
			height: 0;
			margin: 0;
			visibility: hidden;
			opacity: 0;
		}
	}
	
	&__add {
		@media(max-width: $media-break) {
			display: none;
		}
	}
	
	&--expanded {
		@media(min-width:$media-break) {
			width: 89vw;
		}
		#articleMap {
			height: $map-expanded-height;
		}
	}
	
	&__expand {
		text-align: right;
		// this is cheating
		position: relative;
		top: -27px;
		right: 7px;
		z-index: 1000;
		height: 0;
		svg {
			cursor: pointer;
			stroke: currentColor;
			stroke-width: 2;
			width: 20px;
		}
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

// hiding the leaflet edit toolbar in mobile
.leaflet-draw {
	@media(max-width: $media-break) { display: none }
}

</style>