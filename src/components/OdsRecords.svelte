<script>
    import ods from "../utilities/ods";
    import config from "../config.json";

    export let search = "";
    export let refines = {};
    export let records;
    export let errorMsg;

    $: ods.getRecords(config.domainid, config.datasetid, search, refines)
            .then((res) => {
                records = res.records;
                errorMsg = undefined;
            })
            .catch((err) => {
                errorMsg = `Pas d'enregistrement (${err.message})`;
                records = [];
            });
</script>