<template>
<div class="inj-home__map-container" @dblclick.once="enableScrollWheelZoom">
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
			return `<a href='/#/${feature.properties.slug}' taregt='_blank'>${feature.properties.name}</a>`
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

.inj-home__map-container {
	@media(min-width: $media-break) {
		padding: $spacing;
	}
}
#homeMap {
	width: 100%;
	height: 500px;
	border: 1px solid black;
}
</style>