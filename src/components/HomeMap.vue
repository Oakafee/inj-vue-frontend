<template>
<div class="inj-home-map__container" @dblclick.once="enableScrollWheelZoom">
	<div v-if="!mapFeatures.features" class="inj-home-map__loading">Loading...</div>
	<div id="homeMap"></div>
	<mapFeaturePatterns />
</div>
</template>

<script>
import L from 'leaflet';
import {mapState} from 'vuex';
import functions from '../functions';
import constants from '../constants';
import mapFeaturePatterns from './MapFeaturePatterns';

export default {
	name: 'HomeMap',
	components: { mapFeaturePatterns },
	data: function () {
		return {
			map: {},
			mapFeatureLayer: {},
			lineStringFeatures: {
				"type": "FeatureCollection",
				"features": [],
			}
		}
	},
	computed: {
		...mapState({
			mapFeatures: 'mapFeaturesList',
		}),
	},
	mounted() {
		if (!this.mapFeatures.features) functions.getMapFeatureList();
		
		this.map = L.map('homeMap', constants.MAP_DEFAULT_OPTIONS);

		L.tileLayer(constants.MAP_TILE_LAYER, {
			attribution: constants.MAP_TILE_ATTRIBUTION
		}).addTo(this.map);
		if(this.mapFeatures.features) this.addFeaturesToMap();
	},
	watch: {
		mapFeatures() {
			if(this.mapFeatures.features) this.addFeaturesToMap();
		}
	},
	methods: {
		addFeaturesToMap() {
			this.mapFeatureLayer = L.geoJSON(this.mapFeatures, {
				style: (feature) => {
					let featureStyles = {
						className: ''
					}
					
					if (feature.geometry.type === 'LineString') {
						// add the clickable transparent fat area around the line first
						featureStyles.className = 'inj-map-feature__line-fattening';
						// collect all the linestrings in a geoJSON feature collection
						this.lineStringFeatures.features.push(feature);
					} else {
						featureStyles.className = functions.getMapClassName(feature, 'hover');
					}
					return featureStyles
				},
				onEachFeature: (feature, layer) => {
					layer.bindPopup(this.popupText(feature));
					layer.bindTooltip(feature.properties.name);
				},
				pointToLayer: (feature, latlng) => {
					return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
				}
			}).addTo(this.map);
			this.addLineStringStyles();
		},
		popupText(feature) {
			return `<p><a href='/#/${feature.properties.slug}' taregt='_blank'>${feature.properties.name}</a></p>`
		},
		addLineStringStyles() {
			// add the thin styled part of linestrings on top of what's already there
			this.mapFeatureLayer = L.geoJSON(this.lineStringFeatures, {
				style: (feature) => {
					return {
						className: `${functions.getMapClassName(feature)} inj-map-feature__line`
					}
				},
				onEachFeature: (feature, layer) => {
					layer.bindPopup(this.popupText(feature));
				},
			}).addTo(this.map);
		},
		enableScrollWheelZoom() {
			this.map.scrollWheelZoom.enable();
		}
	}
}
</script>

<style lang="scss">
@import '../settings.scss';
@import '../mapfeatures.scss';

.inj-home-map {
	&__container {
		margin-bottom: 2 * $spacing;
		@media(min-width:$large-break) {
			flex: 25 1 auto;
			order: 2;
		}
	}
	&__loading {
		position: relative;
		top: $spacing;
		left: 6*$spacing;
		z-index: 99999;
		height: 0;
	}
		
}
#homeMap {
	width: 100%;
	height: 1200px;
	border: 1px solid black;
}

// stupid stupid stupid override of font styles leaflet insists on including
.leaflet-container {
	font: unset !important;
}
</style>