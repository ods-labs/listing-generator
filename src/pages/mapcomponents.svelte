<script>
    import ods from "../utilities/ods";
    import {debounce} from "lodash";
    import config from "../config.json";
    import Select from "svelte-select";
    import Searchbar from "../components/Searchbar.svelte";
    import {onMount} from "svelte";

    import {Feature, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import "../../node_modules/ol/ol.css";
    import VectorLayer from "ol/layer/Vector";
    import VectorSource from "ol/source/Vector";
    import {GeoJSON} from "ol/format";
    import Spinner from "../components/Spinner.svelte";
    import Map from "../components/Map.svelte";
    import MapView from "../components/MapView.svelte";
    import MapTileLayer from "../components/MapTileLayer.svelte";
    import DataLayer from "../components/DataLayer.svelte";
    import LayerSwitcher from "../components/LayerSwitcher.svelte";
    import MapboxStyleLayer from "../components/MapboxStyleLayer.svelte";
    import Overlay from "../components/Overlay.svelte";

    const esri_basemap_url = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    const jawgstyle = "https://api.jawg.io/styles/jawg-light.json?access-token=4cKtE4Rze1HrvxWa9a7mdolSk10lVThTFC8zadQYMIMxTjkpTeIDJAAmhReDGnCH";

    let loading = false;
    let errorMsg;

    let search;
    let categories = {};
    let activeFilter = {};
    let category = [];

    let geojson;

    const debouncedRefresh = debounce(async () => {
        loading = true;
        ods.getGeojson(config.domainid, config.datasetid, search, activeFilter, 500)
            .then((res) => {
                geojson = res;
                errorMsg = undefined;
            })
            .catch((err) => {
                errorMsg = `Pas d'enregistrement (${err.message})`;
                console.error(err);
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
      }} />
            {/each}
        </div>
    </div>

    <div class="map-container">
        <Map>
            <!-- View -->
            <MapView initialCenterLonLat={[2.0, 48.0]} initialZoom="6"></MapView>

            <!-- Basemaps -->
            <MapboxStyleLayer title="Jawg light" style={jawgstyle} />
            <MapTileLayer title="OSM default"></MapTileLayer>
            <MapTileLayer title="ESRI" source={esri_basemap_url} />
            <LayerSwitcher />

            <!-- Data -->
            <DataLayer data={geojson}></DataLayer>

            <!-- Popup -->
            <Overlay title="equnom" />
        </Map>
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
  }
</style>
