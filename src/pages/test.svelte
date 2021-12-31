
<script>
  import { url } from "@roxi/routify";
  import ods from "../utilities/ods";
  import chartUtilities from "../utilities/chartUtilities";
  import { debounce } from "lodash";
  import config from "../config.json";
  import Select from "svelte-select";
  import Searchbar from "../components/Searchbar.svelte";
  import Grid from "../components/Grid.svelte";
  import { onMount } from "svelte";
  let search;
  let records = [];
  let errorMsg;
  let links = [];
  let charts = {};
  let categories = {};
  let activeFilter = {};
  let category = [];
  let title;
  let value;
  let myKpi = [];
  const debouncedRefresh = debounce(async () => {
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
  
    
      ods
        .getAggregates(
          config.domainid,
          config.datasetid,
          search,
          config.kpi.groupBy,
          activeFilter,
          config.kpi.expression
        )
        .then((reskpi) => {
          myKpi = reskpi.records;
          console.log(myKpi);
          title = config.kpi.title;
          // value = myKpi.map(e => e.record.fields.serie);
          errorMsg = undefined;
        })
        .catch((err) => {
          // errorMsg = `Pas d'enregistrement pour le champ ${filter} (${err.message})`;
          console.error(`Pas d'enregistrement pour le champ ${kpi} (${err.message})`);
          records = [];
        });
  }, 500);
  const seeNext = async () => {
    ods
      .getNext(links)
      .then((res) => {
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
@@ -203,26 +202,33 @@
    padding: 10px 0px;
  }
  .select-button {
    width: 150px;
    height: auto;
    border-radius: 4px;
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
  .kpi-container {
    background-color: red;
    background-color: #FFF;
    margin: 0 auto;
     width: 250px; 
     border-radius: 5px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
