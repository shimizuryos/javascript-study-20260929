/*
 * ブラウザ内 TypeScript 型チェックの中核。
 * Web Worker (ts-worker.js) と CI (tests/*.test.ts) の両方から使うため、素の JS で書いている。
 */
(function (root) {
  'use strict';

  var libCache = {};

  function createChecker(ts, libFiles) {
    var options = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      lib: ['lib.es2022.d.ts'],
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowImportingTsExtensions: false,
    };

    function getLibSourceFile(name) {
      if (!libCache[name]) {
        var text = libFiles[name];
        if (text === undefined) return undefined;
        libCache[name] = ts.createSourceFile('/lib/' + name, text, ts.ScriptTarget.ES2022, true);
      }
      return libCache[name];
    }

    return function check(files) {
      var host = {
        getSourceFile: function (fileName, languageVersion) {
          if (fileName.indexOf('/lib/') === 0) return getLibSourceFile(fileName.slice(5));
          var name = fileName.replace(/^\/src\//, '');
          if (!Object.prototype.hasOwnProperty.call(files, name)) return undefined;
          return ts.createSourceFile(fileName, files[name], languageVersion, true);
        },
        getDefaultLibFileName: function () {
          return '/lib/lib.es2022.d.ts';
        },
        getDefaultLibLocation: function () {
          return '/lib';
        },
        writeFile: function () {},
        getCurrentDirectory: function () {
          return '/src';
        },
        getDirectories: function () {
          return [];
        },
        fileExists: function (fileName) {
          if (fileName.indexOf('/lib/') === 0) return libFiles[fileName.slice(5)] !== undefined;
          return Object.prototype.hasOwnProperty.call(files, fileName.replace(/^\/src\//, ''));
        },
        readFile: function (fileName) {
          if (fileName.indexOf('/lib/') === 0) return libFiles[fileName.slice(5)];
          return files[fileName.replace(/^\/src\//, '')];
        },
        directoryExists: function (dir) {
          return dir === '/src' || dir === '/lib' || dir === '/';
        },
        getCanonicalFileName: function (f) {
          return f;
        },
        useCaseSensitiveFileNames: function () {
          return true;
        },
        getNewLine: function () {
          return '\n';
        },
      };
      var rootNames = Object.keys(files).map(function (f) {
        return '/src/' + f;
      });
      var program = ts.createProgram({ rootNames: rootNames, options: options, host: host });
      var diagnostics = ts.getPreEmitDiagnostics(program);
      return diagnostics.map(function (d) {
        var result = { code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') };
        if (d.file) {
          var pos = d.file.getLineAndCharacterOfPosition(d.start || 0);
          result.file = d.file.fileName.replace(/^\/src\//, '');
          result.line = pos.line + 1;
          result.column = pos.character + 1;
        }
        return result;
      });
    };
  }

  var api = { createChecker: createChecker };
  root.TypecheckCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis);
