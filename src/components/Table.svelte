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
      <th></th>
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
        <a href="https://www.google.com/maps/search/{record.record.fields[config.fieldCoordinates].lat},{record.record.fields[config.fieldCoordinates].lon}" target="_blank">L</a>
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
  /* Dropdown */
  .table-dropdown-container {
    position: relative;
    margin-right: 4px;;
  }
  .table-dropdown-button {
    width: 28px;
    height: 28px;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid transparent;
    border-radius: 4px;
    margin-left: auto;
  }
  .table-basic tr:hover .table-dropdown-button {
    border-color: var(--highlight);
  }
  .table-dropdown-button-active {
    box-shadow: 0 0 0 3px rgba(20, 46, 123, 0.3);
    border-color: var(--highlight);
  }
  .table-dropdown {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    border: 1px solid #FFFFFF;
    border-radius: 4px;
    border-color: rgba(222, 229, 239, 1);
    padding: 13px;
    white-space: nowrap;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    transition: visibility 0s, opacity 0.1s ease, top 0.1s ease;
  }
  .table-dropdown-visible {
    visibility: visible;
    opacity: 1;
    top: 38px;
  }
  .table-dropdown-item {
    padding: 2px 6px 2px 0;
    display: block;
  }
  .table-dropdown-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    cursor: auto;
  }
  
</style>
