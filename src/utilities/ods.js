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
    // refine : { 'fieldid' : 'valeur du refine' }
    const client = new ApiClient({ domain: domainid });
    let query = fromCatalog().dataset(datasetid).records().limit(12);
    let keys = Object.keys(refine);
    for (let i = 0; i < keys.length; i += 1) {
        query = query.refine(`${keys[i]}:"${refine[keys[i]]}"`);
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

const getFilterCategories = async(domainid, datasetid, search = "", field, refine = {}) => {
    const client = new ApiClient({ domain: domainid });
    let query = fromCatalog()
        .dataset(datasetid)
        .records()
        .groupBy(field);
    let keys = Object.keys(refine);
    for (let i = 0; i < keys.length; i += 1) {
        if (keys[i] != field) {
            query = query.refine(`${keys[i]}:"${refine[keys[i]]}"`);
        }
    }
    if (search) {
        query = query.where(`"${search}"`);
    }
    return client.get(query)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

const getAggregates = async(domainid, datasetid, search = "", field, refine = {}) => {
    const client = new ApiClient({ domain: domainid });
    let query = fromCatalog()
        .dataset(datasetid)
        .aggregates()
        .select("count(*) as count")
        .groupBy(field)
        .orderBy("-count")
    let keys = Object.keys(refine);
    for (let i = 0; i < keys.length; i += 1) {
        query = query.refine(`${keys[i]}:"${refine[keys[i]]}"`);
    }
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

export default { getRecords, getDatasets, getNext, getFilterCategories, getAggregates }