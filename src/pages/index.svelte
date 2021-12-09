<script>
  import { url } from "@roxi/routify";
  import ods from "../utilities/ods";
  import chartUtilities from "../utilities/chartUtilities";
  import { debounce } from "lodash";
  import config from "../config.json";
  import Select from "svelte-select";

  let search;
  let records = [];
  let errorMsg;
  let links = [];
  let myChart = undefined;

  //let categories = [];
  let categories = {};
  //let activeFilter;
  let activeFilter = {};

  let limit;

  const debouncedRefresh = debounce(async () => {
    // console.log(activeFilter);
    ods
      .getRecords(config.domainid, config.datasetid, search, activeFilter)
      .then((res) => {
        links = res.links;
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
          categories[filter] = rescat.aggregations;
          errorMsg = undefined;
        })
        .catch((err) => {
          // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
          console.error(`Pas d'enregistrement pour le champ ${filter} (${err.message})`);
          records = [];
        });
    });
    ods.getAggregates(
        config.domainid,
        config.datasetid,
        search,
        config.axex,
        activeFilter
      )
      .then((resagg) => {
        if (myChart==undefined) {
       myChart = chartUtilities.createChart("myChart",resagg,config.title,config.axex);
       console.log(myChart);
      } else {
        chartUtilities.updateChart(myChart,resagg,config.axex);
      };
        errorMsg = undefined;
      })
      .catch((err) => {
        // errorMsg = `Pas d'enregistrement pour le champ ${config.axex} (${err.message})`;
        console.error(`Pas d'enregistrement pour le champ ${config.axex} (${err.message})`);
        records = [];
      });
  }, 500);

  const seeNext = async () => {
    ods
      .getNext(links)
      .then((res) => {
        // console.log(res);
        records = res.records;
        links = res.links;
        errorMsg = undefined;
      })
      .catch((err) => {
        // errorMsg = `DatasetID introuvable ou erreur de connexion (${err.message})`;
        console.error(`DatasetID introuvable ou erreur de connexion (${err.message})`);
        records = [];
        links = [];
      });
  };

  debouncedRefresh();

  const manageFilter = (event) => {
    //  event.detail : { 'id' : 'valeur sélectionnée' }
    // console.log(activeFilter);
    // console.log(event);
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
    <label class="search-box">
      <input type="text" bind:value={search} on:input={debouncedRefresh} />
    </label>
    <div class="select-button">
      {#each config.filters as filter}
        <Select
          items={categories[filter]}
          optionIdentifier="{filter};"
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
          }}
        />
      {/each}
    </div>
  </div>
  {#if errorMsg}
    {errorMsg}
  {/if}

  <div class="chart-container">
    <canvas id="myChart" height="300" width="500" />
  </div>
  <div class="grid">
    {#each records as record}
      <div class="box">
        <h3>{record.record.fields[config.fieldTitle]}</h3>
        <p>{record.record.fields[config.fieldType]}</p>
        <p>{record.record.fields.naturelibelle}</p>
        <ul>
          <li>Commune : {record.record.fields.comlib}</li>
        </ul>
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
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
  .chart-container {
    position: relative;
    display: block;
    padding: 20px 40px;
}

canvas {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
}
</style>
