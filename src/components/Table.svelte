<script>
  import config from "../config.json";
  export let records;
</script>

<div class="table-module">
  <table class="table-basic">
  <thead>
    <tr>
      {#each config.fieldList as field}
      <th>{field.title}</th>
      {/each}
      <th>Localisation</th>
    </tr>
  </thead>
  <tbody>
    {#each records as record}
    <tr>
      {#each config.fieldList as field}
      <td>{record.record.fields[field.id]}</td>
      {/each}
      <td>
        {#if record.record.fields[config.fieldCoordinates]}
        <a href="https://www.google.com/maps/search/{record.record.fields[config.fieldCoordinates].lat},{record.record.fields[config.fieldCoordinates].lon}" target="_blank">Ouvrir dans Google Maps</a>
        {/if}
      </td>
    </tr>
    {/each}
  </tbody>
</table>
</div>


<style lang="scss">
  @import "../styles/variables";
  
  /* Table with dropdown
  ========================================================================== */
  .table-module {
    height: 400px;
    overflow-y: auto;
  }
  .table-basic {
    display: table;
    border-collapse: collapse;
    width: 100%;
    white-space: nowrap;
    background-color: #FFFFFF;
  }
  .table-basic thead th {
    color: var(--titles);
    background-color: #f6f8fb;
    font-weight: 500;
    padding: 13px 6px;
    position: sticky;
    top: 0;
    z-index: 1;
    text-align: left;
  }
  .table-basic tr td,
  .table-basic tbody th {
    font-weight: normal;
    border-top: 1px solid #dee5ef;
  }
  .table-basic tr td {
    padding: 13px 6px;
  }
</style>
