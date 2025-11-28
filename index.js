const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------
// FUNCIÓN PARA FORMATEAR EL TIPO
// ----------------------------------
function formatearTipo(tipo) {
  return tipo
    .replace("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ----------------------------------
// DATOS EN MEMORIA (SIN BASE DE DATOS)
// ----------------------------------

let horarios = [
  // Centro 1
  { id: 1, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 2, hora: "08:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 3, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 4, hora: "10:45", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },

  { id: 5, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 6, hora: "14:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 7, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },
  { id: 8, hora: "16:30", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 1 },

  // Centro 2
  { id: 9, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 10, hora: "08:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 11, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 12, hora: "10:45", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },

  { id: 13, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 14, hora: "14:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 15, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },
  { id: 16, hora: "16:30", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 2 },

  // Centro 3
  { id: 17, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 18, hora: "08:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 19, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 20, hora: "10:45", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },

  { id: 21, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 22, hora: "14:15", tipo: "caninos", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 23, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, cupos_ocupados: 0, centro: 3 },
  { id: 24, hora: "16:30", tipo: "felinos", cupos_totales: 4, cupos_ocupados: 0, centro: 3 }
];

let reservas = [];

// ------------------------
// ENDPOINT: LISTAR TURNOS
// ------------------------
app.get("/turnos", (req, res) => {
  const { tipo, centro } = req.query;

  if (!tipo || !centro) {
    return res.status(400).json({ error: "Faltan parámetros: tipo y centro" });
  }

  const disponibles = horarios.filter(h =>
    h.tipo === tipo &&
    h.centro === Number(centro) &&
    h.cupos_ocupados < h.cupos_totales
  );

  // Agregar tipo formateado en la respuesta
  const disponiblesFormateados = disponibles.map(h => ({
    ...h,
    tipo_formateado: formatearTipo(h.tipo)
  }));

  const horarios_texto = disponibles.map(h => h.hora).join(", ");

  res.json({
    horarios_disponibles: disponiblesFormateados,
    horarios_texto
  });
});

// ------------------------
// ENDPOINT: BUSCAR ID AUTOMÁTICAMENTE
// ------------------------
app.get("/buscar-id", (req, res) => {
  const { hora, tipo, centro } = req.query;

  if (!hora || !tipo || !centro) {
    return res.status(400).json({ error: "Faltan parámetros: hora, tipo, centro" });
  }

  const turno = horarios.find(h =>
    h.hora === hora &&
    h.tipo === tipo &&
    h.centro === Number(centro)
  );

  if (!turno) {
    return res.status(404).json({ error: "No existe un turno con esos datos" });
  }

  res.json({ id: turno.id });
});

// ------------------------
// ENDPOINT: RESERVAR TURNO
// ------------------------
app.post("/reservar", (req, res) => {
  const { horario_id, nombre, telefono } = req.body;

  if (!horario_id || !nombre || !telefono) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  let turno = horarios.find(h => h.id === horario_id);

  if (!turno) {
    return res.status(404).json({ error: "El turno no existe" });
  }

  if (turno.cupos_ocupados >= turno.cupos_totales) {
    return res.status(400).json({
      error: "El horario llenó sus cupos"
    });
  }

  turno.cupos_ocupados++;

  const codigo = "CST-" + Math.floor(10000 + Math.random() * 90000);

  reservas.push({
    horario_id,
    nombre,
    telefono,
    hora: turno.hora,
    tipo: turno.tipo,
    centro: turno.centro,
    codigo
  });

  res.json({
    mensaje: "Turno reservado con éxito",
    hora: turno.hora,
    tipo: formatearTipo(turno.tipo),  // ← YA VIENE FORMATEADO
    centro: turno.centro,
    codigo
  });
});

// ----------------------------------
// RESET AUTOMÁTICO DIARIO DE CUPOS
// ----------------------------------

function resetCuposDiarios() {
  horarios.forEach(h => h.cupos_ocupados = 0);
  console.log("🔄 Cupos reiniciados automáticamente a las 00:00");
}

setInterval(() => {
  const ahora = new Date();
  if (ahora.getHours() === 0 && ahora.getMinutes() === 0) {
    resetCuposDiarios();
  }
}, 60000);

// ------------------------
// RUTA DE PRUEBA
// ------------------------
app.get("/", (req, res) => {
  res.send("API de Castraciones funcionando correctamente ✔");
});

// ------------------------
// LEVANTAR SERVIDOR
// ------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
