<template>
<div class="inj-home__map-container">
	<div id="homeMap"></div>
	<ul>{{ mapFeatures }}
		<li
			v-for="feature in mapFeatures.features"
			:key="feature.properties.name"
		>{{ feature.properties.name }}
		</li>
	</ul>
</div>
</template>

<script>
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
		this.map = L.map('homeMap', {
			maxZoom: constants.MAP_MAX_ZOOM
			//scrollWheelZoom: false
		}).setView(constants.NJ_CENTER, constants.MAP_ZOOM_LEVEL);

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
	}
}
</script>

<style lang="scss">
@import '../mapfeatures.scss';

#homeMap {
	width: 100%;
	height: 500px;
	border: 1px solid black;
}
</style>