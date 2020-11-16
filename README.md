<a name="module_url-get"></a>

## url-get
This module contains library functions to fetch and parse YAML or JSON content
at local or remote URLs.

NOTE: This module codebase currently lives in the [EventGate](https://github.com/wikimedia/eventgate) repository.
TODO: Move url-get to its own git repository.


* [url-get](#module_url-get)
    * [~objectFactory(data)](#module_url-get..objectFactory) ⇒ <code>Object</code>
    * [~uriHasProtocol(uri)](#module_url-get..uriHasProtocol) ⇒ <code>boolean</code>
    * [~fileExtension(filename)](#module_url-get..fileExtension) ⇒ <code>string</code>
    * [~resolveUri(uri, baseUri, defaultFileExtension)](#module_url-get..resolveUri) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [~urlGet(url, options)](#module_url-get..urlGet) ⇒ <code>Promise.&lt;string&gt;</code>
    * [~urlGetObject(url, options)](#module_url-get..urlGetObject) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [~urlGetFirstObject(urls, options)](#module_url-get..urlGetFirstObject) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [~uriGetFirstObject(uri, baseUris, defaultFileExtension, options)](#module_url-get..uriGetFirstObject) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="module_url-get..objectFactory"></a>

### url-get~objectFactory(data) ⇒ <code>Object</code>
Converts a utf-8 byte buffer or a YAML/JSON string into
an object and returns it.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type |
| --- | --- |
| data | <code>string</code> \| <code>Buffer</code> \| <code>Object</code> | 

<a name="module_url-get..uriHasProtocol"></a>

### url-get~uriHasProtocol(uri) ⇒ <code>boolean</code>
Returns true if the uri has protocol schema on the front, else false.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type |
| --- | --- |
| uri | <code>string</code> | 

<a name="module_url-get..fileExtension"></a>

### url-get~fileExtension(filename) ⇒ <code>string</code>
Returns the file extension (or the last part after a final '.' in a file basename)
of a filename path. If no file extension is present, this returns an empty string.
If the final part of a file name after '.' is numeric, this is not a file
extension, and an empty string will be returned.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type |
| --- | --- |
| filename | <code>string</code> | 

<a name="module_url-get..resolveUri"></a>

### url-get~resolveUri(uri, baseUri, defaultFileExtension) ⇒ <code>Promise.&lt;Object&gt;</code>
Takes a possibly relative uri, and augments it so that it is better suited for use in requests.
If the uri is already qualified (e.g. is starts with a protocol scheme), baseUri will
not be prepended.
If the uri already ends in a file extensions, defaultFileExtension  will not be appended.
If the baseUri given does not have a protocol schema, it is assumed to be file://.
file:// paths will be resolved with path.resolve to be transformed into absolute file paths.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | uri to resolve with baseUri and defaultFileExtension |
| baseUri | <code>string</code> | If given, uris that don't start with a protocol scheme will be prepended with this. |
| defaultFileExtension | <code>string</code> | If given, uris that don't end with a file extension will be appended with this. |

<a name="module_url-get..urlGet"></a>

### url-get~urlGet(url, options) ⇒ <code>Promise.&lt;string&gt;</code>
Given a string URL, returns a Promise of the contents at that
URL.  Supports both file:// (via fs.readFile) and other http
based URLs with preq.get.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| options | <code>Object</code> | Options to pass to the function used to                         open the url.  This will be different                         for local files vs remote (http) URIs,                         so make sure you pass options that make                         sense for that url. |

<a name="module_url-get..urlGetObject"></a>

### url-get~urlGetObject(url, options) ⇒ <code>Promise.&lt;Object&gt;</code>
Given a URL, returns a Promise of the contents at that
converted into an Object.  The content at URL
must either be a JSON or YAML string.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| options | <code>Object</code> | Options to pass to the function used to                         open the url.  This will be different                         for local files vs remote (http) URIs,                         so make sure you pass options that make                         sense for that url. |

<a name="module_url-get..urlGetFirstObject"></a>

### url-get~urlGetFirstObject(urls, options) ⇒ <code>Promise.&lt;Object&gt;</code>
Given a list of URLs, returns a Promise of the first resolved
result of urlGetObject. If no URL resolves, this will return
the final rejection.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> |  |
| options | <code>Object</code> | Options to pass to the function used to                         open the url.  This will be different                         for local files vs remote (http) URIs,                         so make sure you pass options that make                         sense for that url. |

<a name="module_url-get..uriGetFirstObject"></a>

### url-get~uriGetFirstObject(uri, baseUris, defaultFileExtension, options) ⇒ <code>Promise.&lt;Object&gt;</code>
Combines resolveUri and urlGetObjectFirst to return the first
baseUri + uri combination that resolves to an object.

**Kind**: inner method of [<code>url-get</code>](#module_url-get)  

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | uri to resolve with baseUri and defaultFileExtension |
| baseUris | <code>Array.&lt;string&gt;</code> | If given, uris that don't start with a protocol scheme will be prepended with these. |
| defaultFileExtension | <code>string</code> | If given, uris that don't end with a file extension will be appended with this. |
| options | <code>Object</code> | Options to pass to the function used to                         open the url.  This will be different                         for local files vs remote (http) URIs,                         so make sure you pass options that make                         sense for that url. |

