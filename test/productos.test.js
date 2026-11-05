const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const app = require('../src/app');
const pool = require('../src/config/db');

const producto = {
  id: 1,
  nombre: 'Laptop',
  descripcion: 'Portátil',
  precio: 1200,
  stock: 5
};

let server;
let baseUrl;
let debeFallarConsulta = false;
let consultas = 0;

before(async () => {
  pool.execute = async (query, values = []) => {
    consultas += 1;
    if (debeFallarConsulta) {
      throw new Error('detalle interno de conexión');
    }

    if (query === 'SELECT * FROM productos') {
      return [[producto]];
    }
    if (query === 'SELECT * FROM productos WHERE id = ?') {
      return [String(values[0]) === '1' ? [producto] : []];
    }
    if (query.startsWith('INSERT INTO productos')) {
      return [{ insertId: 2 }];
    }
    if (query.startsWith('UPDATE productos')) {
      return [{ affectedRows: String(values[4]) === '1' ? 1 : 0 }];
    }
    if (query.startsWith('DELETE FROM productos')) {
      return [{ affectedRows: String(values[0]) === '1' ? 1 : 0 }];
    }

    throw new Error(`Consulta de prueba inesperada: ${query}`);
  };

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const solicitar = async (ruta, metodo = 'GET', cuerpo) => {
  const response = await fetch(`${baseUrl}${ruta}`, {
    method: metodo,
    headers: cuerpo === undefined ? {} : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
  });

  assert.match(response.headers.get('content-type'), /application\/json/);
  return { status: response.status, body: await response.json() };
};

test('GET lista todos los productos', async () => {
  const response = await solicitar('/api/productos');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [producto]);
});

test('GET por ID devuelve el producto o 404', async () => {
  assert.deepEqual(await solicitar('/api/productos/1'), {
    status: 200,
    body: producto
  });
  assert.deepEqual(await solicitar('/api/productos/9999'), {
    status: 404,
    body: { error: 'Producto no encontrado' }
  });
});

test('POST valida datos y crea productos', async () => {
  consultas = 0;
  assert.deepEqual(await solicitar('/api/productos', 'POST', {}), {
    status: 400,
    body: { error: 'Los campos nombre, precio y stock son obligatorios' }
  });
  assert.equal(consultas, 0);

  const response = await solicitar('/api/productos', 'POST', {
    nombre: 'Mouse',
    precio: 25.5,
    stock: 3
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.id, 2);
});

test('PUT valida datos y diferencia producto existente de inexistente', async () => {
  const body = { nombre: 'Laptop actualizada', precio: 1300, stock: 4 };
  assert.equal((await solicitar('/api/productos/1', 'PUT', body)).status, 200);
  assert.equal((await solicitar('/api/productos/9999', 'PUT', body)).status, 404);
  assert.equal((await solicitar('/api/productos/1', 'PUT', {})).status, 400);
});

test('DELETE devuelve 200 o 404 según exista el producto', async () => {
  assert.equal((await solicitar('/api/productos/1', 'DELETE')).status, 200);
  assert.equal((await solicitar('/api/productos/9999', 'DELETE')).status, 404);
});

test('responde JSON 400 para JSON malformado y 404 para rutas desconocidas', async () => {
  const malformed = await fetch(`${baseUrl}/api/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(malformed.status, 400);
  assert.match(malformed.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await malformed.json(), {
    error: 'El cuerpo de la petición debe contener JSON válido'
  });

  assert.deepEqual(await solicitar('/ruta-inexistente'), {
    status: 404,
    body: { error: 'Endpoint no encontrado' }
  });
});

test('oculta detalles de fallos de base de datos y responde 500', async () => {
  debeFallarConsulta = true;
  try {
    const response = await solicitar('/api/productos');
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, {
      error: 'Error interno del servidor al obtener los productos'
    });
    assert.doesNotMatch(JSON.stringify(response.body), /detalle interno/);
  } finally {
    debeFallarConsulta = false;
  }
});
