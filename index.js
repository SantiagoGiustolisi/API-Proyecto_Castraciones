const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


// ----------------------------------
// FUNCIÓN PARA FORMATEAR EL TIPO
// ----------------------------------
function formatearTipo(tipo) {
  const [base, estado] = tipo.split("_");

  let especie = "";
  if (base === "caninos") especie = "Perro";
  if (base === "felinos") especie = "Gato";

  let estadoTexto = "";
  if (estado === "preñadas") estadoTexto = "preñada";

  return estadoTexto ? `${especie} ${estadoTexto}` : especie;
}


// ----------------------------------
// TURNOS DISPONIBLES (SIN BD)
// ----------------------------------
let horarios = [
  // Centro 1
  { id: 1, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 1 },
  { id: 2, hora: "08:15", tipo: "caninos", cupos_totales: 4, centro: 1 },
  { id: 3, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, centro: 1 },
  { id: 4, hora: "10:45", tipo: "felinos", cupos_totales: 4, centro: 1 },

  { id: 5, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 1 },
  { id: 6, hora: "14:15", tipo: "caninos", cupos_totales: 4, centro: 1 },
  { id: 7, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, centro: 1 },
  { id: 8, hora: "16:30", tipo: "felinos", cupos_totales: 4, centro: 1 },

  // Centro 2
  { id: 9, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 2 },
  { id: 10, hora: "08:15", tipo: "caninos", cupos_totales: 4, centro: 2 },
  { id: 11, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, centro: 2 },
  { id: 12, hora: "10:45", tipo: "felinos", cupos_totales: 4, centro: 2 },

  { id: 13, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 2 },
  { id: 14, hora: "14:15", tipo: "caninos", cupos_totales: 4, centro: 2 },
  { id: 15, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, centro: 2 },
  { id: 16, hora: "16:30", tipo: "felinos", cupos_totales: 4, centro: 2 },

  // Centro 3
  { id: 17, hora: "07:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 3 },
  { id: 18, hora: "08:15", tipo: "caninos", cupos_totales: 4, centro: 3 },
  { id: 19, hora: "09:45", tipo: "felinos_preñadas", cupos_totales: 4, centro: 3 },
  { id: 20, hora: "10:45", tipo: "felinos", cupos_totales: 4, centro: 3 },

  { id: 21, hora: "13:15", tipo: "caninos_preñadas", cupos_totales: 4, centro: 3 },
  { id: 22, hora: "14:15", tipo: "caninos", cupos_totales: 4, centro: 3 },
  { id: 23, hora: "15:30", tipo: "felinos_preñadas", cupos_totales: 4, centro: 3 },
  { id: 24, hora: "16:30", tipo: "felinos", cupos_totales: 4, centro: 3 }
];


// LISTA DE RESERVAS (runtime)
let reservas = [];


// ----------------------------------
// ENDPOINT: TURNOS DISPONIBLES
// ----------------------------------
app.get("/turnos", (req, res) => {
  const { tipo, centro, fecha } = req.query;

  if (!tipo || !centro || !fecha) {
    return res.status(400).json({ error: "Faltan parámetros: tipo, centro y fecha" });
  }

  const disponibles = horarios.filter(h => {
    if (h.tipo !== tipo) return false;
    if (h.centro !== Number(centro)) return false;

    const ocupados = reservas.filter(r =>
      r.horario_id === h.id && r.fecha === fecha
    ).length;

    return ocupados < h.cupos_totales;
  });

  res.json({
    horarios_disponibles: disponibles.map(h => ({
      ...h,
      tipo_formateado: formatearTipo(h.tipo)
    })),
    horarios_texto: disponibles.map(h => h.hora).join(", ")
  });
});


// ----------------------------------
// ENDPOINT: BUSCAR ID POR HORA + TIPO + CENTRO
// ----------------------------------
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


// ----------------------------------
// ENDPOINT: RESERVAR TURNO
// ----------------------------------
app.post("/reservar", (req, res) => {
  const { horario_id, nombre, telefono, fecha } = req.body;

  if (!horario_id || !nombre || !telefono || !fecha) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const turno = horarios.find(h => h.id === horario_id);
  if (!turno) {
    return res.status(404).json({ error: "El turno no existe" });
  }

  const ocupados = reservas.filter(r =>
    r.horario_id === horario_id && r.fecha === fecha
  ).length;

  if (ocupados >= turno.cupos_totales) {
    return res.status(400).json({
      error: `El horario ${turno.hora} está lleno para la fecha ${fecha}.`
    });
  }

  const codigo = "CST-" + Math.floor(10000 + Math.random() * 90000);

  reservas.push({
    horario_id,
    nombre,
    telefono,
    fecha,
    hora: turno.hora,
    tipo: turno.tipo,
    centro: turno.centro,
    codigo
  });

  res.json({
    mensaje: "Turno reservado con éxito",
    fecha,
    hora: turno.hora,
    tipo: formatearTipo(turno.tipo),
    centro: turno.centro,
    codigo
  });
});


// ----------------------------------
// STATUS CHECK
// ----------------------------------
app.get("/", (req, res) => {
  res.send("API de Castraciones funcionando correctamente ✔");
});


// ----------------------------------
// SERVER
// ----------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
