const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./routes/productosRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición debe contener JSON válido' });
  }

  console.error('Error inesperado en la solicitud:', error.message);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

module.exports = app;
