<script>
    import Select from "svelte-select";
    import DatasetStore from "../stores/DatasetStore";
    import Maplibre from "../components/Maplibre.svelte";
    import MaplibreSource from "../components/MaplibreSource.svelte";
    import MaplibreStyleLayer from "../components/MaplibreStyleLayer.svelte";
    import MaplibreGeolocateControl from "../components/MaplibreGeolocateControl.svelte";
    import IGNGeoportailRouting from "../stores/IGNGeoportailRouting";
    import MaplibreFeaturesEvent from "../components/MaplibreFeaturesEvent.svelte";
    import MaplibrePopup from "../components/MaplibrePopup.svelte";

    let data = new DatasetStore("fpassaniti", "idf-golf");
    let records = data.getRecordsStore();
    let naturelibelles = data.getFacetStore("utilisateurs");
    let geojson = data.getGeojsonExport();

    let routing = new IGNGeoportailRouting();
    let dist = routing.getRouting();

    const updateUserLoc = (event) => {
        routing.setStart(event.detail);
    }

    const clickOnFeatures = (event) => {
        let features = event.detail;
        routing.setEnd(features[0].geometry.coordinates);
    }
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

    {#if $dist.duration}
        <h4>
            Routing :
        </h4>
        <p>
            {$dist.duration.toLocaleString()} {$dist.timeUnit}
        </p>
        <p>
            {$dist.distance.toLocaleString()} {$dist.distanceUnit}
        </p>
        <button on:click={() => {routing.resetEnd()}}>Clear routing</button>
    {/if}

    <div class="map-container">
        <Maplibre>
            <MaplibreGeolocateControl watch={true} on:geolocate={updateUserLoc}></MaplibreGeolocateControl>

            <MaplibreSource name="route" data={$dist.geojson}>
                <MaplibreStyleLayer name="routestyle" type="line" paint={{
                        'line-color': '#ff2222',
                        'line-width': 2
                    }}>
                </MaplibreStyleLayer>
            </MaplibreSource>

            <MaplibreSource name="data" data={$geojson}>
                <MaplibreStyleLayer name="datastyle">
                    <MaplibrePopup multiple>
                        <h3 style="margin-top: 6px">!%- insnom %!</h3>
                        <p>!%- comlib %!</p>
                        <ul>
                            <li>!%- equipementtypelib %!</li>
                            <li>!%- famille_type_d_equipement %!</li>
                        </ul>
                    </MaplibrePopup>
                    <!--                    <MaplibreFeaturesEvent on:click={clickOnFeatures}></MaplibreFeaturesEvent>-->
                </MaplibreStyleLayer>
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
