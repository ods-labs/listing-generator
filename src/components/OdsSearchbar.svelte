<script>
  import {debounce} from "lodash";

  export let search = "";
  let localsearch = "";

  const debouncedInput = debounce(async () => {
    console.log(localsearch);
    search = localsearch;
  }, 500);
</script>

<label class="search-box">
  <input type="text" 
         placeholder="Recherchez..."
         bind:value={localsearch}
         on:input={debouncedInput} />
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
