<template>
	<div class="inj-article-map-container" :class="{ 'inj-article-map-hidden' : mapHidden }">
		<div id="articleMap"></div>
	</div>
</template>

<script>
import L from 'leaflet';
import {mapState} from 'vuex';
import constants from '../constants';

export default {
	name: 'ArticleMap',
	data: function () {
		return {
			map: '',
			mapFeatureLayer: {},
		}
	},
	mounted() {
		// the view and zoom are somewhat arbitrary because of the auto bounding around the feature
		this.map = L.map('articleMap').setView([40.26, -74.50], 7).setMaxBounds(constants.MAP_MAX_BOUNDS);

		L.tileLayer(constants.MAP_TILE_LAYER, {
			attribution: constants.MAP_TILE_ATTRIBUTION
		}).addTo(this.map);
	},
	computed: {
		...mapState({
			feature: 'articleMapFeature',
		}),
		mapHidden() {
			return !this.feature.geometry;
		}
    },
	watch: {
		feature() {
			if (this.map.hasLayer(this.mapFeatureLayer)) {
				this.mapFeatureLayer.remove();
			}
			if (this.feature.geometry) {
				this.mapFeatureLayer = L.geoJSON(this.feature, {
					style: { 'color': constants.MAP_FEATURE_COLOR_PRIMARY },
					onEachFeature: function(feature, layer) {
						layer.bindPopup(feature.properties.name);
					}
				}).addTo(this.map);
				this.map.fitBounds(this.mapFeatureLayer.getBounds());
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../node_modules/leaflet/dist/leaflet.css';
@import '../settings.scss';


#articleMap {
	width: calc(100% - 2*$spacing);
	height: 280px;
	border: 1px solid black;
}

.inj-article-map-container.inj-article-map-hidden {
	height: 0;
	visibility: hidden;
}

</style>