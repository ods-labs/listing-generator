<script>
    import Table from "../components/Table.svelte";
    import config from "../config.json";
    import Select from "svelte-select";
    import DatasetStore from "../stores/datasetStore";

    let data = new DatasetStore(config.domainid, config.datasetid);
    let records = data.getRecordsStore();
</script>

<div class="container mx-auto mt-6">
    <label class="search-box">
        <input type="text"
               placeholder="Recherchez..."
               on:input={(event) => data.setQuery(event.target.value)}/>
    </label>

    <Select showChevron={true}
            items={['Découvert','Intérieur']}
            on:select={(event) => { event.detail ? data.refine("naturelibelle", event.detail.value) : ''}}/>

    <Table records={$records} ref="smalltable"/>
</div>
