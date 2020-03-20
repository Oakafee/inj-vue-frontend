<template>
	<div>	
		<div
			class="inj-article-map-container"
			:class="{
				'inj-article-map-hidden' : mapHidden,
				'inj-article-map--expanded': mapExpanded
			}"
			@dblclick="enableScrollWheelZoom"
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
		
		<div class="inj-article-map__add inj-fade-transition inj-button-row" :class="{ 'inj-fade-transition--hidden' : !editable }" v-if="editPermission">
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
			<button
				class="inj-button inj-button-small"
				@click="toggleModal(true)" v-if="!mapHidden"
			>Paste data </button>
			<button
				class="inj-button inj-button-tertiary inj-button-small"
				@click="removeFromMap"
				v-if="nonDeletedMapFeature"
			>Remove from map </button>
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
			<div class="inj-button-row">
				<button class="inj-button inj-button-secondary" @click="cancelPasteData()">Cancel</button>
				<button class="inj-button" :class="{ 'inj-button--error' : validationError }" @click="addPastedFeature()">Add</button>
			</div>
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
	props: ['editable', 'editPermission'],
	data: function () {
		return {
			map: '',
			mapFeatureLayer: {},
			mapDrawIcon: {},
			mapDrawToolbar: {},
			mapEditToolbar: {},
			pasteDataModalOpen: false,
			pasteDataType: null,
			wCoord: null,
			nCoord: null,
			geoJson: null,
			validationError: null,
			drawNewFeature: false,
			selectedGeoCategory: null,
		}
	},
	computed: {
		...mapState({
			feature: 'articleMapFeature',
			newMapFeature: 'newMapFeature',
			geoCategories: 'geoCategories',
			mapExpanded: 'articleMapExpanded'
		}),
		nonDeletedMapFeature() {
			if (this.feature.geometry) {
				if (this.feature.geometry.coordinates) return true;
			}
			if (this.newMapFeature.geometry) {
				if (this.newMapFeature.geometry.coordinates) return true;
			}
			return false;
		},
		mapHidden() {
			// have to check if there's a feature and if it's a non-deleted feature. a deleted feature will have geometry but no coordinates
			// is the newMapFeature condition even doing anything?
			if (
				this.nonDeletedMapFeature || this.drawNewFeature
			) {
				return false;
			}
			return true;
		},
    },
	mounted() {
		if (this.geoCategories.length === 0) functions.getGeoCategories();
		
		this.map = L.map('articleMap', constants.MAP_DEFAULT_OPTIONS);

		L.tileLayer(constants.MAP_TILE_2_LAYER, {
			attribution: constants.MAP_TILE_2_ATTRIBUTION
		}).addTo(this.map);
		
		/*
		if(this.feature.geometry && this.feature.geometry.coordinates) {
			this.addFeatureToMap(this.feature);
		}*/
	},
	watch: {
		feature() {
			this.updateFeatureOnMap(this.feature);
			// cheap shortcut for on route change
			this.map.scrollWheelZoom.disable();
		},
		newMapFeature() {
			// if the new map feature is being set to {}, then we don't update the map. Note that if we are deleting the newMapFeature, then it WON't be {}, but rather a null geojson feature
			if (this.newMapFeature.geometry) {
				this.updateFeatureOnMap(this.newMapFeature);
			} else if (this.newMapFeature.cancelEditing) {
				// so this will happen if you click "Cancel Edits," in order to restore the articleMapFeature
				this.updateFeatureOnMap(this.feature);
				store.commit('addNewMapFeature', {});
			}
		},
		editable() {
			if(this.editable) {
				if(this.nonDeletedMapFeature) {
					this.initializeEditToolbar();
				} else {
					this.initializeDrawToolbar();
				}
			} else {
				// does .options make sense?
				if (this.mapDrawToolbar.options) this.mapDrawToolbar.remove();
				else if (this.mapEditToolbar.options) this.mapEditToolbar.remove();
				store.commit('toggleArticleMapSize', false);
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
					pointToLayer: (feature, latlng) => {
						return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
					}
				}).addTo(this.map);
				if (this.editable) this.initializeEditToolbar();
				if(feature.properties.category) {
					this.selectedGeoCategory = feature.properties.category;
				} else {
					this.selectedGeoCategory = constants.MAP_DEFAULT_FEATURE_CATIGORY;
				}
				let bounds = this.mapFeatureLayer.getBounds();
				this.map.fitBounds(bounds, {padding: constants.MAP_BOUNDS_PADDING});
			}		
		},
		updateFeatureOnMap(feature) {
			// first, remove the current feature
			if (this.map.hasLayer(this.mapFeatureLayer)) {
				this.mapFeatureLayer.remove();
				//this.map.setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);
				if (this.mapEditToolbar.options) this.mapEditToolbar.remove();
			}
			// then check if there's anything to add
			if(feature.geometry && feature.geometry.coordinates) {
				this.addFeatureToMap(feature);
			} else {
				this.map.setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);
				if (this.editable) this.initializeDrawToolbar();
			}
		},
		initializeDrawToolbar() {
			if (!this.mapFeatureLayer.options) {
				this.mapFeatureLayer = new L.FeatureGroup();
					this.map.addLayer(this.mapFeatureLayer);
			}
			this.mapDrawIcon = new L.DivIcon({
				iconSize: new L.Point(8, 8),
				className: 'leaflet-div-icon inj-article-map__draw-icon'
			});
			this.mapDrawToolbar = new L.Control.Draw(constants.TOOLBAR_DRAW_OPTIONS);
			this.mapDrawToolbar.setDrawingOptions({
				polyline: {
					icon: this.mapDrawIcon
				},
				polygon: {
					icon: this.mapDrawIcon
				}
			});
			this.map.addControl(this.mapDrawToolbar);
			
			this.map.on('draw:drawstart', () => store.commit('mapEditInProgress', true));
			this.map.on('draw:drawstop', () => store.commit('mapEditInProgress', false));			
			this.map.on('draw:created', (e) => {
				this.commitLayerChange(e.layer);
			});
		},
		initializeEditToolbar() {
			let toolbarOptions = constants.TOOLBAR_EDIT_OPTIONS;
			toolbarOptions.edit.featureGroup = this.mapFeatureLayer;
			this.mapEditToolbar = new L.Control.Draw(toolbarOptions);
			// first remove the draw toolbar
			if(this.mapDrawToolbar.options) this.mapDrawToolbar.remove();
			this.map.addControl(this.mapEditToolbar);
			this.map.on('draw:editstart', () => store.commit('mapEditInProgress', true));
			this.map.on('draw:editstop', () => store.commit('mapEditInProgress', false));
			this.map.on('draw:edited', (e) => {
				e.layers.eachLayer((layer) => this.commitLayerChange(layer));
			});
		},
		commitLayerChange(layer) {
			let jsonLayer = layer.toGeoJSON();
			jsonLayer.properties.category = this.selectedGeoCategory;
			store.commit('addNewMapFeature', jsonLayer);
		},
		toggleModal(status) {
			this.pasteDataModalOpen = status;
		},
		addPastedFeature() {
			let newFeature = constants.NULL_GEOJSON_FEATURE;
			if (this.pasteDataType === 'coordinates') {
				newFeature.geometry.type = "Point";
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
			if (this.selectedGeoCategory) {
				newFeature.properties.category = this.selectedGeoCategory;
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
			if (this.nonDeletedMapFeature) {
				let updatedFeature = {};
				if (this.newMapFeature.geometry) {
					if (this.newMapFeature.geometry.coordinates) {
						updatedFeature = JSON.parse(JSON.stringify(this.newMapFeature));
					}
				} else if (this.feature.geometry && this.feature.geometry.coordinates) {
					updatedFeature = JSON.parse(JSON.stringify(this.feature));
				}
				updatedFeature.properties.category = this.selectedGeoCategory;
				store.commit('addNewMapFeature', updatedFeature);
			} else {
				this.drawNewFeature = true;
				// why is the below necessary?
				if(!this.mapDrawToolbar.options) this.initializeDrawToolbar();
			}
		},
		enableScrollWheelZoom() {
			let zoom = this.map.scrollWheelZoom
			
			if (!zoom._enabled) {
				zoom.enable();
			}
		},
		expandMap(expanded) {
			store.commit('toggleArticleMapSize', expanded);
			let self = this;
			setTimeout(function() {
				self.map.invalidateSize(true); //the true is for panning the map
			}, 600); // 0.6s is the css transition time
		},
		removeFromMap() {
			store.commit('addNewMapFeature', constants.NULL_GEOJSON_FEATURE);
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
		margin: $spacing 0;
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
		margin-bottom: $spacing;
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
	&__draw-icon {
		background-color: $color-secondary;
		border-radius: 4px;
		// size for draw icons is being set in the JS above, for edit icons in the ugly css below with important rules
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


// was too hard for me to use JS to change the edit marker icons, like I successfully did for the draw marker icons, so I am just overriding the CSS class with the styles I want. Terrible I know but oh well.
.leaflet-editing-icon {
	height: 8px !important;
	width: 8px !important;
	margin-left: -4px !important;
	margin-top: -4px !important;
	@extend .inj-article-map__draw-icon;
}
</style>