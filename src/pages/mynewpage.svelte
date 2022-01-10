<script>
  import Table from "../components/Table.svelte";
  import OdsRecords from "../components/OdsRecords.svelte";
  import config from "../config.json";
  import OdsSearchbar from "../components/OdsSearchbar.svelte";
  import OdsFacet from "../components/OdsFacet.svelte";

  let search;
  let records = [];
  let facets = {};
  let refines = {};
</script>

<div class="header">
  <h1>My new Page title</h1>
  <p>Here is a description</p>
</div>

<div class="container mx-auto">
      <div class="bloc">
  <OdsRecords {search} {refines} bind:records />

  <Table {records} />
    <div class="search-tools">
        <OdsSearchbar bind:search />

        {#each config.filters as filter}
            <OdsFacet search={search}
                      field={filter.id}
                      placeholder={`Sélectionnez un ${filter.title}`}
                      bind:refines={refines}
                      bind:facets={facets}/>
        {/each}
    </div>
</div>

</div>

<style lang="scss">
  body {
    margin-top: 0px;
  }
  .container {
    padding: 10px;
  }

  .header {
    background-color: var(--highlight);
    min-height: 180px; /* Change the height of the image here by increasing or decreasing the pixels. */
    /* Properties of the title located within the image banner */
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 40px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url("https://images.unsplash.com/photo-1541890289-b86df5bafd81?ixlib=rb-1.2.1&auto=format&fit=crop&w=2828&q=80");
    color: #fff;
    h1 {
      font-size: 40px;
      font-weight: 700;
    }
    p {
      font-style: italic;
      font-size: 20px;
    }
  }

  .bloc {
    display: flex;
    gap: 20px;
  }

  .search {
    margin: 10px 0px;
  }

  .search-tools {
      display: flex;
      flex-direction: column;
      gap: 10px;

  }
</style>
