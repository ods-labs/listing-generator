<script>
    export let title;
    export let value;
</script>


<div class="kpi">
    <h1>
        {(value | 0).toLocaleString()}
    </h1>
    <p>{title}</p>
</div>


<style lang="scss">
    @import "../styles/variables";

    .kpi {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        @include box-large;
    }
</style>