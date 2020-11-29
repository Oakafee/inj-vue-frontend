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
				},
				pointToLayer: (feature, latlng) => {
					return L.circleMarker(latlng, constants.MAP_POINT_MARKER_OPTIONS);
				}
			}).addTo(this.map);
			this.addLineStringStyles();
			this.addPatternStyles();
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
					console.log('line feature', feature.properties.name, feature.geometry.type);
				},
			}).addTo(this.map);
		},
		addPatternStyles() {
			let svg = document.querySelector('svg.leaflet-zoom-animated');
			let svgNs = 'http://www.w3.org/2000/svg';
			let defs = document.createElementNS(svgNs, 'defs');
			let pattern = document.createElementNS(svgNs, 'pattern');
			let polygon = document.createElementNS(svgNs, 'polygon');
			//let circletwo = document.querySelector("#circleTwo");

			polygon.setAttribute('points', '0,0 2,5 0,10 5,8 10,10 8,5 10,0 5,2');
			pattern.setAttribute('id', 'star');
			pattern.setAttribute('viewBox', '0,0,10,10');
			pattern.setAttribute('width', '10%');
			pattern.setAttribute('height', '10%');
  
			pattern.append(polygon);
			defs.append(pattern);
			svg.prepend(defs);

			let mapShapes = document.querySelectorAll('.inj-map-feature__pyhsiographic-region');
			mapShapes.forEach(path => {
				path.setAttribute('fill', 'url(#star)');
				svg.append(path);	
			})
			// TODO: prepend defs to <svg> that leaflet auto-created
			// TODO: select each shape that we want to pattern (I think we'll start with mountains), change its fill to url(#mtnPattern), append it to the bottom of the <svg>
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