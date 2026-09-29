/*
 * 型チェック用 Web Worker。TypeScript 本体 (約 9MB) を読み込むので、
 * メイン画面が固まらないよう別スレッドで動かす。初回だけ数秒かかる。
 */
importScripts('../vendor/typescript/typescript.js', './typecheck-core.js');

var checkerPromise = null;

function loadChecker() {
  if (!checkerPromise) {
    checkerPromise = (async function () {
      var base = '../vendor/typescript/';
      var manifest = await (await fetch(base + 'manifest.json')).json();
      var libFiles = {};
      await Promise.all(
        manifest.libs.map(async function (name) {
          libFiles[name] = await (await fetch(base + 'lib/' + name)).text();
        }),
      );
      libFiles['test-globals.d.ts'] = await (await fetch('./test-globals.d.ts')).text();
      try {
        var messages = await (await fetch(base + 'diagnosticMessages.ja.json')).json();
        if (typeof ts.setLocalizedDiagnosticMessages === 'function') ts.setLocalizedDiagnosticMessages(messages);
      } catch {
        // 日本語メッセージが読めなくても英語で続行
      }
      return { check: self.TypecheckCore.createChecker(ts, libFiles), globals: libFiles['test-globals.d.ts'] };
    })();
  }
  return checkerPromise;
}

self.onmessage = async function (event) {
  var data = event.data;
  try {
    var checker = await loadChecker();
    var files = Object.assign({ 'test-globals.d.ts': checker.globals }, data.files);
    var diagnostics = checker.check(files);
    self.postMessage({ id: data.id, diagnostics: diagnostics });
  } catch (e) {
    self.postMessage({ id: data.id, error: String((e && e.message) || e) });
  }
};
