<script>
  import { createEventDispatcher } from "svelte";
  import config from "../config.json";
  export let records;
  export let links;

  const dispatch = createEventDispatcher();

  function childSeeNext() {
    dispatch("click");
  }
</script>

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
  <a on:click={childSeeNext}>See next 10 results</a>
{/if}

<style>
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
</style>
