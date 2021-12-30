<script>
  import { url } from "@roxi/routify";
  import ods from "../utilities/ods";
  import chartUtilities from "../utilities/chartUtilities";
  import { debounce } from "lodash";
  import config from "../config.json";
  import Select from "svelte-select";
  import Searchbar from "../components/Searchbar.svelte";
  import Grid from "../components/Grid.svelte";
  import Table from "../components/Table.svelte";
  import Kpi from "../components/Kpi.svelte";
  import { onMount } from "svelte";
  
  let search;
  let records = [];
  let errorMsg;
  let charts = {};
  let categories = {};
  let activeFilter = {};
  let category = [];
  let mykpis = {};
  
  
  const debouncedRefresh = debounce(async () => {
    ods
    .getRecords(config.domainid, config.datasetid, search, activeFilter)
    .then((res) => {
      records = res.records;
      errorMsg = undefined;
    })
    .catch((err) => {
      errorMsg = `Pas d'enregistrement (${err.message})`;
      records = [];
    });
    config.filters.forEach((filter) => {
      ods
      .getFilterCategories(
      config.domainid,
      config.datasetid,
      search,
      filter,
      activeFilter
      )
      .then((rescat) => {
        category = rescat.records;
        categories[filter] = category.map((e) => e.record.fields);
        // console.log(categories[filter]);
        errorMsg = undefined;
      })
      .catch((err) => {
        // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
        console.error(`Pas d'enregistrement pour le champ ${filter} (${err.message})`);
        records = [];
      });
    });
    config.charts.forEach((chart) => {
      ods
      .getAggregates(
      config.domainid,
      config.datasetid,
      search,
      chart.axex,
      activeFilter,
      chart.expression
      )
      .then((resagg) => {
        if (charts[chart.id] == undefined) {
          charts[chart.id] = chartUtilities.createChart(
          chart.id,
          resagg,
          chart.title,
          chart.axex,
          chart.type,
          chart.expression
          );
        } else {
          chartUtilities.updateChart(
          charts[chart.id],
          resagg,
          chart.axex,
          chart.expression
          );
        }
        errorMsg = undefined;
      })
      .catch((err) => {
        // errorMsg = `Pas d'enregistrement pour le champ ${config.axex} (${err.message})`;
        console.error(
        `Pas d'enregistrement pour le champ ${config.axex} (${err.message})`
        );
        records = [];
      });
    });
    
    config.kpis.forEach((kpi) => {
      ods
      .getAggregates(
      config.domainid,
      config.datasetid,
      search,
      kpi.groupBy,
      activeFilter,
      kpi.expression
      )
      .then((reskpi) => {
        mykpis[kpi.id] = reskpi.records[0].record.fields.serie;
        errorMsg = undefined;
      })
      .catch((err) => {
        // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
        console.error(`Pas de kpi pour l'expression ${kpi.expression} (${err.message})`);
        delete mykpis[kpi.title];
      });
    }); 
    
  }, 500);
  

  onMount(() => {
    debouncedRefresh();
  });
  
  const manageFilter = (event) => {
    if (event.detail) {
      let id = Object.keys(event.detail)[0];
      activeFilter[id] = event.detail[id];
    }
    debouncedRefresh();
  };
  const manageClear = (id) => {};
</script>

<div class="container mx-auto mt-6">
  <h1>Équipements sportifs en Île-de-France</h1>

  <div class="search-container">
    <Searchbar on:input={debouncedRefresh} bind:search />
    
    <div class="select-buttons">
      {#each config.filters as filter}
      <Select
      showChevron={true}
      placeholder={`Sélectionnez un ${filter}`}
      items={categories[filter]}
      optionIdentifier={filter}
      getOptionLabel={(option) => option[filter]}
      getSelectionLabel={(option) => option[filter]}
      on:select={function moncallbackrefine(event) {
        if (event.detail) {
          let id = Object.keys(event.detail)[0];
          activeFilter[id] = event.detail[id];
        }
        debouncedRefresh();
      }}
      on:clear={function moncallbackdevenement(event) {
        delete activeFilter[filter];
        debouncedRefresh();
      }} />
      {/each}
    </div>
  </div>
  {#if errorMsg}
  {errorMsg}
  {/if}
  <div class="kpi-container">
    {#each config.kpis as kpi}
    <Kpi title={kpi.title} value={mykpis[kpi.id]}></Kpi>
    {/each}
  </div>
  <div class="chart-containers">
    {#each config.charts as chart}
    <div class="chart-container">
      <canvas id={chart.id} />
    </div>
    {/each}
  </div>
  <Table bind:records />
</div>

<style lang="scss">
  @import "../styles/variables";

  .container {
    padding: 10px;
  }

  h1 {
    margin-bottom: 40px;
  }

  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 40px;
  }
  
  .select-buttons {
    display: flex;
    gap: 20px;
    
    :global(.selectContainer) {
      min-width: 280px;
    }
  }
  
  .chart-containers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
    width: 100%;
    gap: 10px;
    margin: 20px 0;

    .chart-container {
      position: relative;
      min-height: 300px; 
      max-height: 400px;
      
      @include box-common-styles;
    }
  }
  
  .kpi-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
