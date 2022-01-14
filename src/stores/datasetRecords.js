import {derived} from 'svelte/store';
import {ApiClient} from "@opendatasoft/api-client/src/client/index";
import {fromCatalog} from "@opendatasoft/api-client/src/odsql/index";

const __getRecords = (datasetContext, set) => {
    if (datasetContext.domain) {
        const client = new ApiClient({domain: datasetContext.domain});
        let query = fromCatalog()
            .dataset(datasetContext.dataset)
            .records()
            .limit(datasetContext.parameters.limit)
            .offset(datasetContext.parameters.offset);
        let keys = Object.keys(datasetContext.parameters.refine || {});
        for (let i = 0; i < keys.length; i += 1) {
            query = query.refine(`${keys[i]}:"${datasetContext.parameters.refine[keys[i]]}"`);
        }
        if (datasetContext.parameters['q']) {
            query = query.where(`"${datasetContext.parameters['q']}"`)
        }
        client.get(query)
            .then(res => res)
            .then(res => {
                console.log(`Set ${res.records.length} records`);
                set(res.records)
            })
            .catch((err) => console.log(err));
    }
}

// export const datasetRecords = derived(datasetContext, ($datasetContext, set) => {
//     let timeoutId = setTimeout(() => {
//         __getRecords($datasetContext, set);
//     }, 300);
//     return () => {
//         clearTimeout(timeoutId);
//     }
// }, []);

export default (datasetContext) => {
    return derived(datasetContext, ($datasetContext, set) => {
        let timeoutId = setTimeout(() => {
            __getRecords($datasetContext, set);
        }, 300);
        return () => {
            clearTimeout(timeoutId);
        }
    }, []);
}