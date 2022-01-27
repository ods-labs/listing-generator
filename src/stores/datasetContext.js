import {writable} from 'svelte/store';

function createDatasetContext() {
    const {subscribe, set, update} = writable({});

    const defaultParameters = {
        limit: 20,
        offset: 0
    }

    return {
        subscribe,
        init: (domain, dataset, parameters = defaultParameters) => set({
            'domain': domain,
            'dataset': dataset,
            'parameters': parameters
        }),
        setQuery: (q) => update(dc => {
            dc.parameters['q'] = q;
            return dc;
        }),
        refine: (k, v) => update(dc => {
            dc.parameters['refines'][k] = v;
            return dc;
        })
    };
}

export const datasetContext = createDatasetContext();