import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('interface de aprovações é publicada e não contém execução automática', async () => {
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const js = await readFile(new URL('../web/approvals-ui.js', import.meta.url), 'utf8');
  assert.match(html, /data-view="approvals"/);
  assert.match(html, /id="approval-items"/);
  assert.match(html, /src="\/approvals-ui.js"/);
  assert.match(js, /fingerprint: item\.fingerprint/);
  assert.match(js, /audit\.valid/);
  assert.doesNotMatch(js, /eval\s*\(|new Function\s*\(/);
});
