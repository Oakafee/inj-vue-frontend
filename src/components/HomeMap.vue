<template>
<div class="inj-home-map__container" @dblclick.once="enableScrollWheelZoom">
	<div v-if="!mapFeatures.features" class="inj-home-map__loading">Loading...</div>
	<div id="homeMap"></div>
</div>
</template>

<script>
import L from 'leaflet';
import {mapState} from 'vuex';
import functions from '../functions';
import constants from '../constants';

export default {
	name: 'HomeMap',
	data: function () {
		return {
			map: {},
			mapFeatureLayer: {},
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
				onEachFeature: (feature, layer) => {
					layer.bindPopup(this.popupText(feature));
					layer.setStyle({ 'className': functions.getMapClassName(feature) });
				},
				pointToLayer: (feature, latlng) => {
					return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
				}
			}).addTo(this.map);		
		},
		popupText(feature) {
			return `<p><a href='/#/${feature.properties.slug}' taregt='_blank'>${feature.properties.name}</a></p>`
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
	height: 500px;
	border: 1px solid black;
}

// stupid stupid stupid override of font styles leaflet insists on including
.leaflet-container {
	font: unset !important;
}
</style>