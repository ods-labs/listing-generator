<script>
    import {metatags} from '@roxi/routify'
    
    metatags.title = 'My Routify app'
    metatags.description = 'Description coming soon...'
</script>

<slot />

<style lang="postcss" global>
    input, button {
        @apply px-2 py-1 bg-white rounded;
    }
    
    button {
        @apply border hover:bg-gray-200;
    }
    
    .light {
        @apply font-light text-gray-800;
    }
</style>