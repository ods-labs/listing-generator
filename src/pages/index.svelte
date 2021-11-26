<script>
  import { url } from "@roxi/routify";
  import ods from "../utilities/ods";
  import { debounce } from "lodash";
  import config from "../config.json";
  import Select from 'svelte-select';


  let search;
  let records = [];
  let errorMsg;
  let links= [];
  let categories = [];
  let activeFilter;
  let limit;

  const debouncedRefresh = debounce(async () => {
      ods.getRecords(config.domainid, config.datasetid, search, {field: config.filter, value: activeFilter})
      .then(res => {
          links = res.links;
          records = res.records;
          errorMsg = undefined;
      })
      .catch(err => {
          errorMsg = `Pas d'enregistrement (${err.message})`;
          records = [];
      });
      ods.getFilterCategories(config.domainid, config.datasetid, search, config.filter)
      .then(rescat => {
          categories = rescat.aggregations;
          errorMsg = undefined;
      })
      .catch(err => {
          errorMsg = `Pas d'enregistrement (${err.message})`;
          records = [];
      });
  }, 500);

  const seeNext = async () => {
      ods.getNext(links)
      .then(res => {
          console.log(res);
          records = res.records;
          links = res.links;
          errorMsg = undefined;
      })
      .catch(err => {
          errorMsg = `DatasetID introuvable ou erreur de connexion (${err.message})`;
          records = [];
          links = [];
      });
  }

  debouncedRefresh();

 const manageFilter = (event) => {
     if (event.detail) 
         activeFilter = event.detail[config.filter];
      else 
         activeFilter = undefined;
         debouncedRefresh();
 }
	
</script>

<div class="container mx-auto mt-6">
  <h1>Patrimoine Wallon</h1>
  <div class="search-container">
    <label class="search-box">
        <input type="text" bind:value={search} on:input={debouncedRefresh} />
      </label>
      <div class="select-button">
  <Select items={categories}
  optionIdentifier={config.filter};
  getOptionLabel={(option) => option[config.filter]}
  getSelectionLabel={(option) => option[config.filter]}
 on:select={manageFilter} on:clear={manageFilter}></Select>
  
  </div>
  
  
</div>
  {#if errorMsg}
    {errorMsg}
  {/if}
 

  <div class="grid">
    {#each records as record}
      <div class="box">
        <h3>{record.record.fields.libelle}</h3>
        <p>{record.record.fields.histo}</p>
        <ul>
          <li>Commune : {record.record.fields.commune}</li>
          <li>Date arrêtée : {record.record.fields.datearrete}</li>
        </ul>
        <a href="{record.record.fields.liendoc}">Lien</a>
    </div>
    {/each}
    </div>
  {#if links.length > 0}
    <!-- svelte-ignore a11y-missing-attribute -->
    <a on:click={seeNext}>See next 10 results</a>
  {/if}

  <hr />

  <p>
    To see an example app that shows off a lot of Routify's features, go to <a
      href="/example">/example</a
    >
  </p>
  <p>
    This template is ready to be used in production! just delete the example app
    at: src/pages/example
  </p>
</div>

<style lang="scss" global>
.container {
  padding: 10px;
}
    .search-container {
        display: flex;
        padding: 10px 0px;
    }

    .search-box {
        margin-right: 10px;
        border: var(--border, 1px solid #d8dbdf);
        height: 40px;
        input {
            height: 40px;
        }
    }

    .select-button {
        width: 150px;
        height: auto;
        border-radius: 4px;
    }
    .grid {
    grid-template-columns: repeat(4, auto);
    grid-gap: 20px;
    margin-bottom: 10px;
  }

  @media (max-width: 767px) {
    .grid {
    grid-template-columns: repeat(1, auto);
    }
  }


  .box {
    border: 1px solid rgba(0, 0, 0, 0.24);
    padding: 20px;
    border-radius: 5px;
    background: #FFF;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
</style>