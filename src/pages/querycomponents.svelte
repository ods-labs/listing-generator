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

<div class="container mx-auto mt-6">
  <div class="search-container">
    <OdsSearchbar bind:search />
    <div class="select-buttons">
      {#each config.filters as filter}
        <OdsFacet
          {search}
          field={filter.id}
          placeholder={`Sélectionnez un ${filter.title}`}
          bind:refines
          bind:facets />
      {/each}
    </div>
  </div>
  <OdsRecords {search} {refines} bind:records />
  <Table {records} ref="smalltable" />

</div>

<style lang="scss">

  @import "../styles/variables";

  .container {
    padding: 10px;
  }

  .search-container {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    flex-direction: row;
    align-items: center;
  }

  @media (max-width: 767px) {
    .search-container,
    .select-buttons {
      flex-direction: column;
    }
  }

  .select-buttons {
    display: flex;
    gap: 20px;

    :global(.selectContainer) {
      min-width: 280px;
    }
  }
</style>
