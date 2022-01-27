<script>
    import ods from "../utilities/ods";
    import config from "../config.json";

    export let field = undefined;
    export let search = "";
    export let refines = {};

    export let facets;
    export let errorMsg;

    $: ods.getFacets(config.domainid, config.datasetid, search, field, refines)
        .then((res) => {
            facets[field] = res.facets[0]?.facets;
            errorMsg = undefined;
        })
        .catch((err) => {
            errorMsg = `Pas d'enregistrement (${err.message})`;
            facets = [];
        });
</script>