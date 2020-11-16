'use strict';

const fs     = require('fs');
const yaml   = require('js-yaml');
const path   = require('path');
const assert = require('assert');

const {
    objectFactory,
    urlGet,
    urlGetObject,
    fileExtension,
    resolveUri,
    uriHasProtocol,
    urlGetFirstObject,
    uriGetFirstObject,
} = require('..');


const fileName = '_mocha_test_file.yaml';
const filePath = `/tmp/${fileName}`;
const fileUrl = `file://${filePath}`;

const testObject = { a: 'A', b: 1,  a0: { a1: { v: 123 } } };

const testObjectJson = JSON.stringify(testObject);
const testObjectYaml = yaml.safeDump(testObject);

function writeTempFile() {
    fs.writeFileSync(filePath, testObjectYaml);
}

function unlinkTempFile() {
    fs.unlinkSync(filePath);
}

describe('objectFactory', () => {
    it('should return the same object it was given', () => {
        assert.deepEqual(testObject, objectFactory(testObject));
    });

    it('should load from a JSON Buffer', () => {
        const b = Buffer.from(testObjectJson);
        assert.deepEqual(testObject, objectFactory(b));
    });

    it('should load from a JSON string', () => {
        assert.deepEqual(testObject, objectFactory(testObjectJson));
    });

    it('should load from a YAML string', () => {
        assert.deepEqual(testObject, objectFactory(testObjectYaml));
    });

    it('should throw error for bad data', () => {
        assert.throws(() => {
            objectFactory(123);
        });
    });
});

describe('urlGet', () => {

    before(writeTempFile);
    after(unlinkTempFile);

    it('should get contents of file url', (done) => {
        urlGet(fileUrl).then((content) => {
            assert.equal(testObjectYaml, content);
            done();
        });
    });
    // TODO test urlGet from http url?  set up test http server?
});

describe('urlGetObject', () => {

    before(writeTempFile);
    after(unlinkTempFile);

    it('should get object from yaml file url', (done) => {
        urlGetObject(fileUrl).then((content) => {
            assert.deepEqual(testObject, content);
            done();
        });
    });

    // TODO test urlGet and urlGetObject from http url?  set up test http server?
});

describe('urlGetFirstObject', () => {
    before(writeTempFile);
    after(unlinkTempFile);

    it('should get first existant object from list of urls', (done) => {
        const fileUrls = ['/tmp/non_existant1.yaml', fileUrl];
        urlGetFirstObject(fileUrls).then((content) => {
            assert.deepEqual(testObject, content);
            done();
        });
    });

    it('should reject if there are no existant objects at list of urls', (done) => {
        const fileUrls = ['/tmp/non_existant1.yaml', '/tmp/non_existant2.yaml'];
        assert.rejects(() => {
            return urlGetFirstObject(fileUrls)
            .finally(() => done());
        });
    });
});

describe('uriGetFirstObject', () => {
    before(writeTempFile);
    after(unlinkTempFile);

    it('should get first existant object at fileName in list of base URIs', (done) => {
        const baseURIs = ['file:///non_existant1/', 'file:///tmp/'];
        uriGetFirstObject(fileName, baseURIs).then((content) => {
            assert.deepEqual(testObject, content);
            done();
        });
    });

    it('should reject if there are no existant objects at fileName in list of base URIs', (done) => {
        const baseURIs = ['file:///non_existant1/', 'file:///non_existant2/'];
        assert.rejects(() => {
            return uriGetFirstObject(fileName, baseURIs)
            .finally(() => done());
        });
    });
});

describe('fileExtension', () => {
    it('should return empty if no file extension', () => {
        assert.equal('', fileExtension('path/to/file'));
    });
    it('should return empty if no filename', () => {
        assert.equal('', fileExtension(undefined));
    });

    it('should return empty if numeric end of file name', () => {
        assert.equal('', fileExtension('path/to/file/0.0.3'));
    });

    it('should return file extension', () => {
        assert.equal('yaml', fileExtension('path/to/file.yaml'));
    });
});

describe('uriHasProtocol', () => {
    it('should return false if no protocol scheme', () => {
        assert.equal(false, uriHasProtocol('path/to/file.yaml'));
    });

    it('should return true if protocol scheme', () => {
        assert.equal(true, uriHasProtocol('file:///path/to/file.yaml'));
    });
});

describe('resolveUri', () => {
    const testUri = 'path/to/file';
    const absoluteTestUri = path.resolve(testUri);
    const cwd = path.resolve('.') + '/';

    it('should return file:// uri if no baseUri and no defaultFileExtension', () => {
        const expected = `file://${absoluteTestUri}`;
        assert.equal(
            expected,
            resolveUri(testUri, undefined, undefined)
        );
    });

    it('should return file:// uri with defaultFileExtension if no baseUri', () => {
        const expected = `file://${absoluteTestUri}.yaml`;
        assert.equal(
            expected,
            resolveUri(testUri, undefined, '.yaml')
        );
    });

    it('should return file:// uri with protocol-less baseUri and no defaultFileExtension', () => {
        const expected = `file://${absoluteTestUri}`;
        assert.equal(
            expected,
            resolveUri(testUri, cwd, undefined)
        );
    });

    it('should return file:// uri with protocol baseUri and no defaultFileExtension', () => {
        const expected = `file://${absoluteTestUri}`;
        assert.equal(
            expected,
            resolveUri(testUri, `file://${cwd}`, undefined)
        );
    });

    it('should return file:// uri with protocol baseUri and defaultFileExtension', () => {
        const expected = `file://${absoluteTestUri}.yaml`;
        assert.equal(
            expected,
            resolveUri(testUri, `file://${cwd}`, '.yaml')
        );
    });

    it('should return http:// uri with http:// protocol baseUri and defaultFileExtension', () => {
        const expected = `http://domain.example.com/${testUri}.yaml`;
        assert.equal(
            expected,
            resolveUri(testUri, 'http://domain.example.com/', '.yaml')
        );
    });

    it('should return http:// uri with http:// protocol baseUri and no defaultFileExtension', () => {
        const expected = `http://domain.example.com/${testUri}`;
        assert.equal(
            expected,
            resolveUri(testUri, 'http://domain.example.com/', undefined)
        );
    });
});
