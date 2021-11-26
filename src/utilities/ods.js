import { ApiClient, fromCatalog } from '@opendatasoft/api-client';

const getDatasets = async(domainid) => {
    if (!domainid) return { datasets: [] };
    const client = new ApiClient({ domain: domainid });
    const query = fromCatalog()
        .datasets()
        .limit(10)
        .toString();
    return client.get(query)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};



const getRecords = async(domainid, datasetid, search = "", refine = {}) => {
    const client = new ApiClient({ domain: domainid });
    let query = fromCatalog().dataset(datasetid).records().limit(12);
    if (refine.field && refine.value) {
        query = query.refine(`${refine.field}:"${refine.value}"`);
    }
    if (search) {
        query = query.where(`"${search}"`)
    }
    return client.get(query)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

const getFilterCategories = async(domainid, datasetid, search = "", field) => {
    const client = new ApiClient({ domain: domainid });
    let query = fromCatalog()
        .dataset(datasetid)
        .aggregates()
        .groupBy(field);
    if (search) {
        query = query.where(`"${search}"`);
    }
    return client.get(query)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};



const getNext = async(links) => {
    let href;
    links.forEach(element => {
        if (element.rel == 'next')
            href = element.href;
    });
    return fetch(href)
        .then(res => res)
        .then(res => res.json())
        .catch(err => {
            throw err;
        });
}

export default { getRecords, getDatasets, getNext, getFilterCategories }