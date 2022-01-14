import {derived, get, writable} from 'svelte/store';
import {ApiClient} from "@opendatasoft/api-client/src/client/index";
import {fromCatalog} from "@opendatasoft/api-client/src/odsql/index";

const defaultParameters = {
    limit: 20,
    offset: 0
}

const __getRecords = (domain, dataset, parameters, set) => {
    if (domain) {
        const client = new ApiClient({domain: domain});
        let query = fromCatalog()
            .dataset(dataset)
            .records()
            .limit(parameters.limit)
            .offset(parameters.offset);
        let keys = Object.keys(parameters.refine || {});
        for (let i = 0; i < keys.length; i += 1) {
            query = query.refine(`${keys[i]}:"${parameters.refine[keys[i]]}"`);
        }
        if (parameters['q']) {
            query = query.where(`"${parameters['q']}"`)
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

class DatasetStore {
    constructor(domain, dataset, parameters = {}) {
        this.domain = writable(domain);
        this.dataset = writable(dataset);
        this.parameters = writable(Object.assign({}, defaultParameters, parameters));
        this.records = [];
    }

    id = undefined;

    setQuery = (q) => {
        if (this.id) {
            clearTimeout(this.id);
        }
        this.id = setTimeout(() => {
            console.log("set query");
            this.parameters.update(param => {
                param['q'] = q;
                return param;
            })
            clearTimeout(this.id);
        }, 500);

    }

    refine = (k, v) => {
        this.parameters.update(param => {
            if (!param.hasOwnProperty('refine'))
                param['refine'] = {};
            param['refine'][k] = v;
            return param;
        })
    }

    getRecordsStore = () => {
        return derived([this.domain, this.dataset, this.parameters],
            ([$domain, $dataset, $parameters], set) => {
                console.log('call derived', $domain, $dataset, JSON.stringify($parameters));
                    __getRecords($domain, $dataset, $parameters, set);
                return () => {
                }
            }, []);
    }
}

export default DatasetStore;