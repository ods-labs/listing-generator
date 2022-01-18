import {LngLat, LngLatBounds} from "maplibre-gl";

const fitMapBoundsToGeojsonFeaturesPoint = (map, geojson) => {
    let dataBoundaries = new LngLatBounds();
    geojson.features.forEach((feature) => {
        let coords = feature.geometry.coordinates
        dataBoundaries.extend(new LngLat(...coords));
    })
    map.fitBounds(dataBoundaries, {padding: 50});
}

export default { fitMapBoundsToGeojsonFeaturesPoint }