'use strict';

/**
 * This module contains library functions to fetch and parse YAML or JSON content
 * at local or remote URLs.
 *
 * @module url-get
 */

const _        = require('lodash');
const P        = require('bluebird');
const yaml     = require('js-yaml');
const readFile = P.promisify(require('fs').readFile);
const preq     = require('preq');
const basename = require('path').basename;
const { URL }  = require('url');
const path     = require('path');

/**
 * Converts a utf-8 byte buffer or a YAML/JSON string into
 * an object and returns it.
 * @param {string|Buffer|Object} data
 * @return {Object}
 */
function objectFactory(data) {
    // If we were given a byte Buffer, parse it as utf-8 string.
    if (data instanceof Buffer) {
        data = data.toString('utf-8');
    } else if (_.isObject(data)) {
        // if we were given a a JS object, return it now.
        return data;
    }

    // If we now have a string, then assume it is a YAML/JSON string.
    if (_.isString(data)) {
        data = yaml.safeLoad(data);
    } else {
        throw new Error(
            'Could not convert data into an object.  ' +
            'Data must be a utf-8 byte buffer or a YAML/JSON string'
        );
    }

    return data;
}


// https://tools.ietf.org/html/rfc3986#section-3.1
const uriProtocolRegex = /^[a-zA-Z0-9+.-]+:\/\//;
/**
 * Returns true if the uri has protocol schema on the front, else false.
 * @param {string} uri
 * @return {boolean}
 */
function uriHasProtocol(uri) {
    return uriProtocolRegex.test(uri);
}

/**
 * Returns the file extension (or the last part after a final '.' in a file basename)
 * of a filename path. If no file extension is present, this returns an empty string.
 * If the final part of a file name after '.' is numeric, this is not a file
 * extension, and an empty string will be returned.
 * @param {string} filename
 * @return {string}
 */
function fileExtension(filename) {
    if (!filename) {
        return '';
    }

    const parts = basename(filename).split('.');
    if (parts.length > 1 && isNaN(parts[parts.length - 1])) {
        return parts[parts.length - 1];
    } else {
        return '';
    }
}

/**
 * Takes a possibly relative uri, and augments it so that it is better suited for use in requests.
 * If the uri is already qualified (e.g. is starts with a protocol scheme), baseUri will
 * not be prepended.
 * If the uri already ends in a file extensions, defaultFileExtension  will not be appended.
 * If the baseUri given does not have a protocol schema, it is assumed to be file://.
 * file:// paths will be resolved with path.resolve to be transformed into absolute file paths.
 * @param {string} uri
 *      uri to resolve with baseUri and defaultFileExtension
 * @param {string} baseUri
 *      If given, uris that don't start with a protocol scheme will be prepended with this.
 * @param {string} defaultFileExtension
 *      If given, uris that don't end with a file extension will be appended with this.
 * @return {Promise<Object>}
 */
function resolveUri(uri, baseUri, defaultFileExtension) {
    let url = uri;
    // If uri doesn't already have an extension, and we are given a default one, append it.
    if (!fileExtension(uri) && defaultFileExtension) {
        url = uri + defaultFileExtension;
    }

    // If the uri doesn't have a protocol, then we can use
    // the given baseUri as the default.
    if (baseUri && !uriHasProtocol(url)) {
        url = baseUri + url;
    }

    // If the url still doesn't have a protocol, assume it should be file://.
    if (!uriHasProtocol(url)) {
        url = `file://${path.resolve(url)}`;
    }
    return url;
}

/**
 * Given a string URL, returns a Promise of the contents at that
 * URL.  Supports both file:// (via fs.readFile) and other http
 * based URLs with preq.get.
 * @param {string} url
 * @param {Object} options Options to pass to the function used to
 *                         open the url.  This will be different
 *                         for local files vs remote (http) URIs,
 *                         so make sure you pass options that make
 *                         sense for that url.
 * @return {Promise<string>}
 */
function urlGet(url, options = {}) {
    if (!uriHasProtocol(url)) {
        // assume this is a local file path
        return readFile(url, options);
    } else if (url.startsWith('file://')) {
        // still a local file path,
        // parse url to get protocol less path for use with readFile
        return readFile(new URL(url).pathname, options);
    } else {
        options.uri = url;
        // else this is not a local file path, use remote request.
        return preq.get(options).then(res => res.body);
    }
}

/**
 * Given a URL, returns a Promise of the contents at that
 * converted into an Object.  The content at URL
 * must either be a JSON or YAML string.
 * @param {string} url
 * @param {Object} options Options to pass to the function used to
 *                         open the url.  This will be different
 *                         for local files vs remote (http) URIs,
 *                         so make sure you pass options that make
 *                         sense for that url.
 * @return {Promise<Object>}
 */
function urlGetObject(url, options = {}) {
    return urlGet(url, options)
        .then(content => objectFactory(content));
}

/**
 * Given a list of URLs, returns a Promise of the first resolved
 * result of urlGetObject. If no URL resolves, this will return
 * the final rejection.
 * @param {Array<string>} urls
 * @param {Object} options Options to pass to the function used to
 *                         open the url.  This will be different
 *                         for local files vs remote (http) URIs,
 *                         so make sure you pass options that make
 *                         sense for that url.
 * @return {Promise<Object>}
 */
function urlGetFirstObject(urls, options = {}) {
    if (!_.isArray(urls)) {
        urls = [urls];
    }

    // This is a 'fold' like operation on urls, keeping only
    // the first urlGetObject(url) to resolve.
    return urls.reduce((promise, url) => {
        return promise.catch(() => urlGetObject(url, options));
    }, P.reject()); // seed the chain with a rejected promise.
}

/**
 * Combines resolveUri and urlGetObjectFirst to return the first
 * baseUri + uri combination that resolves to an object.
 * @param {string} uri
 *      uri to resolve with baseUri and defaultFileExtension
 * @param {Array<string>} baseUris
 *      If given, uris that don't start with a protocol scheme will be prepended with these.
 * @param {string} defaultFileExtension
 *      If given, uris that don't end with a file extension will be appended with this.
 * @param {Object} options Options to pass to the function used to
 *                         open the url.  This will be different
 *                         for local files vs remote (http) URIs,
 *                         so make sure you pass options that make
 *                         sense for that url.
 * @return {Promise<Object>}
 */
function uriGetFirstObject(uri, baseUris, defaultFileExtension, options = {}) {
    if (!_.isArray(baseUris)) {
        baseUris = [baseUris];
    }

    const urls = _.map(baseUris, (baseUri) => {
        return resolveUri(uri, baseUri, defaultFileExtension);
    });

    return urlGetFirstObject(urls, options);
}


module.exports = {
    objectFactory,
    urlGet,
    urlGetObject,
    fileExtension,
    resolveUri,
    uriHasProtocol,
    urlGetFirstObject,
    uriGetFirstObject,
};
