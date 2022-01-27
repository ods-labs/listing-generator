<script>
    import ods from "../utilities/ods";
    import {debounce} from "lodash";
    import config from "../config.json";
    import Select from "svelte-select";
    import Searchbar from "../components/Searchbar.svelte";
    import {onMount} from "svelte";
    import {
        Select as OlSelect,
        defaults as defaultInteractions,
    } from 'ol/interaction';
    import {Feature, Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import "../../node_modules/ol/ol.css";
    import VectorLayer from "ol/layer/Vector";
    import VectorSource from "ol/source/Vector";
    import {GeoJSON} from "ol/format";
    import Spinner from "../components/Spinner.svelte";
    import {Cluster} from "ol/source";
    import {Text, Fill, RegularShape, Stroke, Style, Circle} from "ol/style";
    import CircleStyle from "ol/style/Circle";
    import {createEmpty, extend, getHeight, getWidth} from "ol/extent";

    let loading = false;
    let errorMsg;

    let search;
    let categories = {};
    let activeFilter = {};
    let category = [];

    let geojsonFeatures = [];

    let map;
    let mapView;
    let vectorLayer;
    let vectorSource;

    const defaultCircleFill = new Fill({
        color: 'rgba(13, 81, 153, 0.7)',
    });
    const defaultCircleStroke = new Stroke({
        color: 'rgb(13, 81, 153)',
        width: 2.5,
    });

    const textFill = new Fill({
        color: [255,255,255],
    });
    const textStroke = new Stroke({
        color: [0, 0, 0, 0.6],
        width: 3,
    });

    let maxFeatureCount;
    const calculateClusterInfo = function (resolution) {
        maxFeatureCount = 0;
        const features = vectorLayer.getSource().getFeatures();
        let feature, radius;
        for (let i = features.length - 1; i >= 0; --i) {
            feature = features[i];
            const originalFeatures = feature.get('features');
            const extent = createEmpty();
            let j, jj;
            for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
                extend(extent, originalFeatures[j].getGeometry().getExtent());
            }
            maxFeatureCount = Math.max(maxFeatureCount, jj);
            radius = (0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
            feature.set('radius', radius);
        }
    };

    let currentResolution;
    function styleFunction(feature, resolution) {
        if (resolution != currentResolution) {
            calculateClusterInfo(resolution);
            currentResolution = resolution;
        }
        let style;
        const size = feature.get('features').length;
        if (size > 1) {
            style = new Style({
                image: new CircleStyle({
                    radius: feature.get('radius'),
                    fill: new Fill({
                        color: [13, 81, 153, Math.min(0.8, 0.4 + size / maxFeatureCount)],
                    }),
                }),
                text: new Text({
                    text: size.toString(),
                    fill: textFill,
                    stroke: textStroke,
                }),
            });
        } else {
            style = new Style({
                image: new Circle({
                    fill: defaultCircleFill,
                    stroke: defaultCircleStroke,
                    radius: 7,
                }),
                fill: defaultCircleFill,
                stroke: defaultCircleStroke,
            })
        }
        return style;
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

                if (vectorLayer)
                    map.removeLayer(vectorLayer);

                vectorSource = new VectorSource({
                    features: geojsonFeatures.filter((feature) => {return feature.getGeometry()})
                })
                vectorLayer = new VectorLayer({
                    source: new Cluster({
                        distance: 40,
                        source: vectorSource
                    }),
                    style: styleFunction
                })
                map.addLayer(vectorLayer);
                // mapView.fit(vectorSource.getExtent(), {duration: 1000});
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
                filter,
                activeFilter
            ).then((rescat) => {
                category = rescat.records;
                categories[filter] = category.map((e) => e.record.fields);
                // console.log(categories[filter]);
                errorMsg = undefined;
            })
                .catch((err) => {
                    // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
                    console.error(`Pas d'enregistrement pour le champ ${filter} (${err.message})`);
                });
        });
    }, 500);

    onMount(() => {
        mapView = new View({
            center: [0, 0],
            zoom: 4
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
                        placeholder={`Sélectionnez un ${filter}`}
                        items={categories[filter]}
                        optionIdentifier={filter}
                        getOptionLabel={(option) => option[filter]}
                        getSelectionLabel={(option) => option[filter]}
                        on:select={function moncallbackrefine(event) {
                                    if (event.detail) {
                                      let id = Object.keys(event.detail)[0];
                                      activeFilter[id] = event.detail[id];
                                    }
                                    debouncedRefresh();
                                  }}
                        on:clear={function moncallbackdevenement(event) {
                                    delete activeFilter[filter];
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
