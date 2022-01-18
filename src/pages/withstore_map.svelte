<script>
    import Table from "../components/Table.svelte";
    import config from "../config.json";
    import Select from "svelte-select";
    import DatasetStore from "../stores/datasetStore";
    import Maplibre from "../components/Maplibre.svelte";
    import MaplibreSource from "../components/MaplibreSource.svelte";
    import MaplibreStyleLayer from "../components/MaplibreStyleLayer.svelte";

    let data = new DatasetStore("fpassaniti", "idf-golf");
    let records = data.getRecordsStore();
    let naturelibelles = data.getFacetStore("utilisateurs");
    let geojson = data.getGeojsonExport();
</script>

<div class="container mx-auto mt-6">
    <label class="search-box">
        <input type="text"
               placeholder="Recherchez..."
               on:input={(event) => data.setQuery(event.target.value)}/>
    </label>

    <Select showChevron={true}
            placeholder={"Nature libellé"}
            items={$naturelibelles}
            optionIdentifier="name"
            labelIdentifier="name"
            on:select={(event) => { event.detail ? data.refine("utilisateurs", event.detail.value) : ''}}
            on:clear={(event) => { data.unrefine("utilisateurs")}}/>

    <div class="map-container">
        <Maplibre>
            <MaplibreSource name="data" data={$geojson}>
                <MaplibreStyleLayer name="datastyle"></MaplibreStyleLayer>
            </MaplibreSource>
        </Maplibre>
    </div>
</div>

<style lang="scss">
    .map-container {
      display: block;
      width: 600px;
      height: 400px;
      background: grey;
    }
</style>
