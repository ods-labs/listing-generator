import {ApiClient} from '../../../ods-dataviz-sdk/packages/api-client/src/client';
import {fromCatalog} from '../../../ods-dataviz-sdk/packages/api-client/src/odsql';

const getDatasets = async (domainid) => {
    if (!domainid) return {datasets: []};
    const client = new ApiClient({domain: domainid});
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

const getRecords = async (domainid, datasetid, search = "", refine = {}) => {
    // refine : { 'fieldid' : 'valeur du refine' }
    const client = new ApiClient({domain: domainid});
    let query = fromCatalog().dataset(datasetid).records().limit(40);
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

const getGeojson = async (domainid, datasetid, search = "", refine = {}, limit = 100) => {
    // refine : { 'fieldid' : 'valeur du refine' }
    const client = new ApiClient({domain: domainid});
    let query = fromCatalog().dataset(datasetid).exports('geojson').limit(limit);
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

const getFilterCategories = async (domainid, datasetid, search = "", field, refine = {}) => {
    const client = new ApiClient({domain: domainid});
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

const getFacets = async (domainid, datasetid, search = "", field, refine = {}) => {
    const client = new ApiClient({domain: domainid});
    let query = fromCatalog()
        .dataset(datasetid)
        .facets()
        .facet(field);
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

const getAggregates = async (domainid, datasetid, search = "", field, refine = {}, expression) => {
    const client = new ApiClient({domain: domainid});
    let query = fromCatalog()
        .dataset(datasetid)
        .records()
        .select(expression + " as serie")
        .orderBy("-serie")
    let keys = Object.keys(refine);
    for (let i = 0; i < keys.length; i += 1) {
        query = query.refine(`${keys[i]}:"${refine[keys[i]]}"`);
    }
    if (search) {
        query = query.where(`"${search}"`);
    }
    if (field) {
        query = query.groupBy(field);
    }

    return client.get(query)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

const getNext = async (links) => {
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

export default {getRecords, getGeojson, getDatasets, getNext, getFilterCategories, getAggregates, getFacets}