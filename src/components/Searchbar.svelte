<script>
  import { createEventDispatcher } from "svelte";
  export let search = "";

  const dispatch = createEventDispatcher();

  function childDebounced() {
    dispatch("input");
  }
</script>

<label class="search-box">
  <input type="text" 
         placeholder="Recherchez..."
         bind:value={search} 
         on:input={childDebounced} />
</label>

<style lang="scss">

  .search-box {
    height: 42px;
    input {
      height: 42px;
      border: var(--border, 1px solid #d8dbdf);
      font-size: var(--inputFontSize, 14px);
    }
  }
</style>
