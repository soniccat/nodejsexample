
export let isObject = function (obj) {
    return obj != null && typeof obj === 'object';
};

export let isEmptyArray = function (array) {
    return Array.isArray(array) && array.length == 0;
};