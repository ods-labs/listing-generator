<script>
    import {getContext, onMount} from "svelte";

    export let name;
    const { getMap } = getContext('map');
    let { source } = getContext('source');
    let map;

    onMount(() => {
        map = getMap();
        map.addLayer({
            id: name,
            type: 'circle',
            source: source,
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#000000'
            }
        });

        return () => {
            if (map.getLayer(name)) {
                map.removeLayer(name);
            }
        }
    });
</script>