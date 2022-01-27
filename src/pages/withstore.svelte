<script>
    import Table from "../components/Table.svelte";
    import config from "../config.json";
    import Select from "svelte-select";
    import DatasetStore from "../stores/datasetStore";

    let data = new DatasetStore(config.domainid, config.datasetid);
    let records = data.getRecordsStore();
    let naturelibelles = data.getFacetStore("naturelibelle");
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
    <Select showChevron={true}
            placeholder={"Nature libellé"}
            items={$naturelibelles}
            optionIdentifier="name"
            labelIdentifier="name"
            on:select={(event) => { event.detail ? data.refine("naturelibelle", event.detail.value) : ''}}
            on:clear={(event) => { data.unrefine("naturelibelle")}}/>

    <Table records={$records} ref="smalltable"/>
</div>
