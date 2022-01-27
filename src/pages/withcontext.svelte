<script>
  import Table from "../components/Table.svelte";
  import config from "../config.json";

  import {datasetContext} from "../stores/datasetContext";
  import DatasetRecords from "../stores/datasetRecords";

  let search;
  let refines = {};

  datasetContext.init(config.domainid, config.datasetid);

  let records = DatasetRecords(datasetContext);

  import DatasetStore from "../stores/datasetStore";
</script>

<div class="container mx-auto mt-6">
  <label class="search-box">
    <input type="text"
           placeholder="Recherchez..."
           on:input={(event) => datasetContext.setQuery(event.target.value)} />
  </label>

  <Table records={$records} ref="smalltable" />
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
