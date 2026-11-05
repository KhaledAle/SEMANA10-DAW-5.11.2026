const pool = require('../config/db');

const esIdValido = (id) => /^\d+$/.test(id) && Number(id) > 0;

const validarProducto = (body) => {
  const { nombre, precio, stock } = body || {};

  if (
    typeof nombre !== 'string' ||
    nombre.trim() === '' ||
    nombre.trim().length > 100 ||
    precio === undefined ||
    stock === undefined
  ) {
    return 'Los campos nombre, precio y stock son obligatorios';
  }

  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0) {
    return 'El precio debe ser un número mayor o igual a 0';
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return 'El stock debe ser un entero mayor o igual a 0';
  }

  const { descripcion } = body;
  if (
    descripcion !== undefined &&
    descripcion !== null &&
    (typeof descripcion !== 'string' || descripcion.length > 255)
  ) {
    return 'La descripción debe ser texto de hasta 255 caracteres';
  }

  return null;
};

const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al obtener los productos' });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ error: 'El id debe ser un entero positivo' });
    }

    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al buscar el producto:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al buscar el producto' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const errorValidacion = validarProducto(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const { nombre, descripcion, precio, stock } = req.body;
    const query = 'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [
      nombre.trim(),
      descripcion || null,
      precio,
      stock
    ]);

    return res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      id: result.insertId,
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      precio,
      stock
    });
  } catch (error) {
    console.error('Error al crear el producto:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al crear el producto' });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ error: 'El id debe ser un entero positivo' });
    }

    const errorValidacion = validarProducto(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const { nombre, descripcion, precio, stock } = req.body;
    const query = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
    const [result] = await pool.execute(query, [
      nombre.trim(),
      descripcion || null,
      precio,
      stock,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado para actualizar' });
    }

    return res.status(200).json({
      mensaje: 'Producto actualizado correctamente',
      producto: { id: Number(id), nombre: nombre.trim(), descripcion: descripcion || null, precio, stock }
    });
  } catch (error) {
    console.error('Error al actualizar el producto:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al actualizar el producto' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ error: 'El id debe ser un entero positivo' });
    }

    const [result] = await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado para eliminar' });
    }

    return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar el producto' });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
