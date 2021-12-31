<script>
    import "../../node_modules/ol/ol.css";
    import config from "../config.json";

    import ods from "../utilities/ods";
    import {debounce} from "lodash";
    import Select from "svelte-select";
    import Searchbar from "../components/Searchbar.svelte";
    import {onMount} from "svelte";

    import {Feature, Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import VectorLayer from "ol/layer/Vector";
    import VectorSource from "ol/source/Vector";
    import {GeoJSON} from "ol/format";
    import Spinner from "../components/Spinner.svelte";
    import {Cluster} from "ol/source";
    import {Text, Fill, Stroke, Style, Circle} from "ol/style";
    import CircleStyle from "ol/style/Circle";
    import {LineString, Point, Polygon} from "ol/geom";
    import monotoneChainConvexHull from "monotone-chain-convex-hull";
    import {fromLonLat} from "ol/proj";
    import {createEmpty, extend, getWidth} from "ol/extent";

    let loading = false;
    let errorMsg;

    let search;
    let categories = {};
    let activeFilter = {};
    let category = [];

    let geojsonFeatures = [];

    let map;
    let mapView;
    let vectorSource;

    let clusterSource;
    let clusterCircles;
    let clusterHulls;
    let clusters;

    const circleDistanceMultiplier = 1;
    const circleFootSeparation = 28;
    const circleStartAngle = Math.PI / 2;

    const convexHullFill = new Fill({
        color: 'rgba(255, 153, 0, 0.4)',
    });
    const convexHullStroke = new Stroke({
        color: 'rgba(204, 85, 0, 1)',
        width: 1.5,
    });
    const outerCircleFill = new Fill({
        color: 'rgba(255, 153, 102, 0.3)',
    });
    const innerCircleFill = new Fill({
        color: 'rgba(255, 165, 0, 0.7)',
    });
    const textFill = new Fill({
        color: '#fff',
    });
    const textStroke = new Stroke({
        color: 'rgba(0, 0, 0, 0.6)',
        width: 3,
    });
    const innerCircle = new CircleStyle({
        radius: 14,
        fill: innerCircleFill,
    });
    const outerCircle = new CircleStyle({
        radius: 20,
        fill: outerCircleFill,
    });
    const defaultCircleFill = new Fill({
        color: 'rgba(13, 81, 153, 0.7)',
    });
    const defaultCircleStroke = new Stroke({
        color: 'rgb(13, 81, 153)',
        width: 2.5,
    });

    /**
     * Single feature style, users for clusters with 1 feature and cluster circles.
     * @param {Feature} clusterMember A feature from a cluster.
     * @return {Style} An icon style for the cluster member's location.
     */
    function clusterMemberStyle(clusterMember) {
        return new Style({
            geometry: clusterMember.getGeometry(),
            image: new Circle({
                fill: defaultCircleFill,
                stroke: defaultCircleStroke,
                radius: 7,
            }),
            fill: defaultCircleFill,
            stroke: defaultCircleStroke,
        });
    }

    let clickFeature, clickResolution;

    /**
     * Style for clusters with features that are too close to each other, activated on click.
     * @param {Feature} cluster A cluster with overlapping members.
     * @param {number} resolution The current view resolution.
     * @return {Style} A style to render an expanded view of the cluster members.
     */
    function clusterCircleStyle(cluster, resolution) {
        if (cluster !== clickFeature || resolution !== clickResolution) {
            return;
        }
        const clusterMembers = cluster.get('features');
        const centerCoordinates = cluster.getGeometry().getCoordinates();
        return generatePointsCircle(
            clusterMembers.length,
            cluster.getGeometry().getCoordinates(),
            resolution
        ).reduce((styles, coordinates, i) => {
            const point = new Point(coordinates);
            const line = new LineString([centerCoordinates, coordinates]);
            styles.unshift(
                new Style({
                    geometry: line,
                    stroke: convexHullStroke,
                })
            );
            styles.push(
                clusterMemberStyle(
                    new Feature({
                        ...clusterMembers[i].getProperties(),
                        geometry: point,
                    })
                )
            );
            return styles;
        }, []);
    }

    /**
     * From
     * https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
     * Arranges points in a circle around the cluster center, with a line pointing from the center to
     * each point.
     * @param {number} count Number of cluster members.
     * @param {Array<number>} clusterCenter Center coordinate of the cluster.
     * @param {number} resolution Current view resolution.
     * @return {Array<Array<number>>} An array of coordinates representing the cluster members.
     */
    function generatePointsCircle(count, clusterCenter, resolution) {
        const circumference =
            circleDistanceMultiplier * circleFootSeparation * (2 + count);
        let legLength = circumference / (Math.PI * 2); //radius from circumference
        const angleStep = (Math.PI * 2) / count;
        const res = [];
        let angle;

        legLength = Math.max(legLength, 35) * resolution; // Minimum distance to get outside the cluster icon.

        for (let i = 0; i < count; ++i) {
            // Clockwise, like spiral.
            angle = circleStartAngle + i * angleStep;
            res.push([
                clusterCenter[0] + legLength * Math.cos(angle),
                clusterCenter[1] + legLength * Math.sin(angle),
            ]);
        }

        return res;
    }

    let hoverFeature;

    /**
     * Style for convex hulls of clusters, activated on hover.
     * @param {Feature} cluster The cluster feature.
     * @return {Style} Polygon style for the convex hull of the cluster.
     */
    function clusterHullStyle(cluster) {
        if (cluster !== hoverFeature) {
            return;
        }
        const originalFeatures = cluster.get('features');
        const points = originalFeatures.map((feature) =>
            feature.getGeometry().getCoordinates()
        );
        return new Style({
            geometry: new Polygon([monotoneChainConvexHull(points)]),
            fill: convexHullFill,
            stroke: convexHullStroke,
        });
    }

    function clusterStyle(feature) {
        const size = feature.get('features').length;
        if (size > 1) {
            return [
                new Style({
                    image: outerCircle,
                }),
                new Style({
                    image: innerCircle,
                    text: new Text({
                        text: size.toString(),
                        fill: textFill,
                        stroke: textStroke,
                    }),
                }),
            ];
        } else {
            const originalFeature = feature.get('features')[0];
            return clusterMemberStyle(originalFeature);
        }
    }

    const debouncedRefresh = debounce(async () => {
        geojsonFeatures = [];
        loading = true;
        ods.getGeojson(config.domainid, config.datasetid, search, activeFilter, 500)
            .then((res) => {
                geojsonFeatures = new GeoJSON().readFeatures(res, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857"
                });
                errorMsg = undefined;

                if (clusters)
                    map.removeLayer(clusters);
                if (clusterHulls)
                    map.removeLayer(clusterHulls);
                if (clusterCircles)
                    map.removeLayer(clusterCircles);

                vectorSource = new VectorSource({
                    features: geojsonFeatures.filter((feature) => {
                        return feature.getGeometry()
                    })
                })
                clusterSource = new Cluster({
                    distance: 35,
                    source: vectorSource,
                });

                // Layer displaying the convex hull of the hovered cluster.
                clusterHulls = new VectorLayer({
                    source: clusterSource,
                    style: clusterHullStyle,
                });

                // Layer displaying the clusters and individual features.
                clusters = new VectorLayer({
                    source: clusterSource,
                    style: clusterStyle,
                });

                // Layer displaying the expanded view of overlapping cluster members.
                clusterCircles = new VectorLayer({
                    source: clusterSource,
                    style: clusterCircleStyle,
                });

                map.addLayer(clusterHulls);
                map.addLayer(clusters);
                map.addLayer(clusterCircles);
            })
            .catch((err) => {
                errorMsg = `Pas d'enregistrement (${err.message})`;
                console.error(err);
                geojsonFeatures = [];
            })
            .finally(() => {
                loading = false;
            })

        config.filters.forEach((filter) => {
            ods.getFilterCategories(
                config.domainid,
                config.datasetid,
                search,
                filter.id,
                activeFilter
            ).then((rescat) => {
                category = rescat.records;
                categories[filter.id] = category.map((e) => e.record.fields);
                // console.log(categories[filter]);
                errorMsg = undefined;
            })
                .catch((err) => {
                    // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
                    console.error(`Pas d'enregistrement pour le champ ${filter.id} (${err.message})`);
                });
        });
    }, 500);

    onMount(() => {
        mapView = new View({
            center: fromLonLat([2.0, 48.0]),
            zoom: 7,
            maxZoom: 18
        })

        map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: mapView
        });

        map.on('pointermove', (event) => {
            if (clusters) {
                clusters.getFeatures(event.pixel).then((features) => {
                    if (features[0] !== hoverFeature) {
                        // Display the convex hull on hover.
                        hoverFeature = features[0];
                        clusterHulls.setStyle(clusterHullStyle);
                        // Change the cursor style to indicate that the cluster is clickable.
                        map.getTargetElement().style.cursor =
                            hoverFeature && hoverFeature.get('features').length > 1
                                ? 'pointer'
                                : '';
                    }
                });
            }
        });

        map.on('click', (event) => {
            if (clusters) {
                clusters.getFeatures(event.pixel).then((features) => {
                    if (features.length > 0) {
                        const clusterMembers = features[0].get('features');
                        if (clusterMembers.length > 1) {
                            // Calculate the extent of the cluster members.
                            const extent = createEmpty();
                            clusterMembers.forEach((feature) =>
                                extend(extent, feature.getGeometry().getExtent())
                            );
                            const view = map.getView();
                            const resolution = map.getView().getResolution();
                            if (
                                view.getZoom() === view.getMaxZoom() ||
                                (getWidth(extent) < resolution && getWidth(extent) < resolution)
                            ) {
                                // Show an expanded view of the cluster members.
                                clickFeature = features[0];
                                clickResolution = resolution;
                                clusterCircles.setStyle(clusterCircleStyle);
                            } else {
                                // Zoom to the extent of the cluster members.
                                view.fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
                            }
                        }
                    }
                });
            }
        });

        debouncedRefresh();
    });
</script>

<div class="container mx-auto mt-6">
    <div class="search-container">
        <Searchbar on:input={debouncedRefresh} bind:search/>

        <div class="select-buttons">
            {#each config.filters as filter}
                <Select
                        showChevron={true}
                        placeholder={`Sélectionnez un ${filter.title}`}
                        items={categories[filter.id]}
                        optionIdentifier={filter.id}
                        getOptionLabel={(option) => option[filter.id]}
                        getSelectionLabel={(option) => option[filter.id]}
                        on:select={function moncallbackrefine(event) {
        if (event.detail) {
          let id = Object.keys(event.detail)[0];
          activeFilter[id] = event.detail[id];
        }
        debouncedRefresh();
      }}
                        on:clear={function moncallbackdevenement(event) {
        delete activeFilter[filter.id];
        debouncedRefresh();
      }}/>
            {/each}
        </div>
    </div>

    <div class="map-container">
        <div id="map"></div>
        <Spinner spin={loading}></Spinner>
    </div>
</div>

<style lang="scss">
  @import "../styles/variables";

  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 40px;
  }

  .select-buttons {
    display: flex;
    gap: 20px;

    :global(.selectContainer) {
      min-width: 280px;
    }
  }

  .map-container {
    position: relative;
    height: 500px;
    width: 100%;

    #map {
      width: 100%;
      height: 100%;
    }
  }
</style>
