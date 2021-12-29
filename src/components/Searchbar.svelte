<script>
  import { createEventDispatcher } from "svelte";
  export let search = "";

  const dispatch = createEventDispatcher();

  function childDebounced() {
    dispatch("input");
  }
</script>

<label class="search-box">
  <input type="text" bind:value={search} on:input={childDebounced} />
</label>

<style lang="scss">

  .search-box {
    margin-right: 10px;
    border: var(--border, 1px solid #d8dbdf);
    height: 40px;
    input {
      height: 40px;
    }
  }
</style>
