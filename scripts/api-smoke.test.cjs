const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const jsonServer = require('json-server');

test('JSON Server persists GET, POST, PUT, PATCH and DELETE with numeric IDs', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'angular-api-smoke-'));
  const database = path.join(directory, 'db.json');
  fs.copyFileSync(path.join(__dirname, '..', 'db.seed.json'), database);
  const app = jsonServer.create();
  app.use(jsonServer.defaults({ logger: false }));
  app.use(jsonServer.bodyParser);
  app.use(jsonServer.router(database));
  const server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const url = `http://127.0.0.1:${server.address().port}/conferences`;
  const request = (target = url, options = {}) => fetch(target, {
    ...options, headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(5000),
  });
  try {
    assert.equal((await (await request()).json()).length, 3);
    assert.equal((await (await request(`${url}?place=Tunis`)).json()).length, 1);
    const draft = { name: 'API smoke test', place: 'Tunis', date: '2099-01-01' };
    const post = await request(url, { method: 'POST', body: JSON.stringify(draft) });
    assert.equal(post.status, 201);
    const created = await post.json();
    assert.equal(typeof created.id, 'number');
    const resource = `${url}/${created.id}`;
    assert.equal((await (await request(resource)).json()).name, draft.name);
    const updated = { ...created, name: 'PUT updated' };
    assert.equal((await request(resource, { method: 'PUT', body: JSON.stringify(updated) })).status, 200);
    const patched = await (await request(resource, { method: 'PATCH', body: JSON.stringify({ place: 'Sousse' }) })).json();
    assert.equal(patched.name, 'PUT updated'); assert.equal(patched.place, 'Sousse');
    const persisted = JSON.parse(fs.readFileSync(database, 'utf8'));
    assert.equal(persisted.conferences.find(item => item.id === created.id).place, 'Sousse');
    assert.equal((await request(resource, { method: 'DELETE' })).status, 200);
    assert.equal((await request(resource)).status, 404);
    assert.equal((await (await request()).json()).length, 3);
  } finally {
    await new Promise(resolve => server.close(resolve));
    // Delete only this test's known file and its now-empty directory.
    fs.unlinkSync(database);
    fs.rmdirSync(directory);
  }
});
