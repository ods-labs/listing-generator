<script>
    import OdsFacetResults from "./OdsFacetResults.svelte";
    import Select from 'svelte-select';

    export let field;
    export let placeholder;

    export let search = "";
    export let refines = {};

    export let facets;
</script>

<OdsFacetResults field={field} search={search} refines={refines} bind:facets={facets}/>
<Select showChevron={true}
        placeholder={placeholder}
        items={facets[field]}
        optionIdentifier="name"
        labelIdentifier="name"
        on:select={(event) => {
                            if (event.detail) {
                              let id = Object.keys(event.detail)[0];
                              refines[field] = event.detail[id];
                              refines = refines;
                            }
                        }}
        on:clear={(event) => {
                            console.log("delete : " + refines[field])
                            delete refines[field];
                            refines = refines; // trigger reactivity, not detected by delete operator
                        }}/>