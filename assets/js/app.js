import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { WHATSAPP_NUMBER, CITAS_COLLECTION, BUSINESS_HOURS, SERVICES, formatCOP } from "./config.js";

const form = document.getElementById("form-cita");
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");
const servicioSelect = document.getElementById("servicio");
const btnAgendar = document.getElementById("btn-agendar");
const formMsg = document.getElementById("form-msg");

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
fechaInput.min = toDateInputValue(hoy);

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function generarHorarios() {
  const [startH, startM] = BUSINESS_HOURS.start.split(":").map(Number);
  const [endH, endM] = BUSINESS_HOURS.end.split(":").map(Number);
  const slots = [];
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += BUSINESS_HOURS.slotMinutes;
  }
  return slots;
}

function parseFechaLocal(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

async function actualizarHorasDisponibles() {
  horaSelect.innerHTML = "";
  const fechaStr = fechaInput.value;

  if (!fechaStr) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.selected = true;
    opt.textContent = "Elige primero una fecha";
    horaSelect.appendChild(opt);
    return;
  }

  const fecha = parseFechaLocal(fechaStr);
  const dayOfWeek = fecha.getDay();

  if (!BUSINESS_HOURS.openDays.includes(dayOfWeek)) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.selected = true;
    opt.textContent = "Cerrado ese día, elige otra fecha";
    horaSelect.appendChild(opt);
    return;
  }

  const opt = document.createElement("option");
  opt.value = "";
  opt.disabled = true;
  opt.selected = true;
  opt.textContent = "Cargando horas disponibles...";
  horaSelect.appendChild(opt);

  let ocupadas = [];
  try {
    const q = query(
      collection(db, CITAS_COLLECTION),
      where("fecha", "==", fechaStr),
      where("estado", "in", ["pendiente", "confirmada"])
    );
    const snap = await getDocs(q);
    ocupadas = snap.docs.map((d) => d.data().hora);
  } catch (err) {
    console.error("No se pudo verificar disponibilidad:", err);
  }

  const esHoy = fecha.getTime() === hoy.getTime();
  const ahoraMinutos = new Date().getHours() * 60 + new Date().getMinutes();

  horaSelect.innerHTML = "";
  const disponibles = generarHorarios().filter((h) => {
    if (ocupadas.includes(h)) return false;
    if (esHoy) {
      const [hh, mm] = h.split(":").map(Number);
      if (hh * 60 + mm <= ahoraMinutos) return false;
    }
    return true;
  });

  if (disponibles.length === 0) {
    const noOpt = document.createElement("option");
    noOpt.value = "";
    noOpt.disabled = true;
    noOpt.selected = true;
    noOpt.textContent = "No hay horas disponibles ese día";
    horaSelect.appendChild(noOpt);
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "Selecciona una hora";
  horaSelect.appendChild(placeholder);

  disponibles.forEach((h) => {
    const o = document.createElement("option");
    o.value = h;
    o.textContent = h;
    horaSelect.appendChild(o);
  });
}

fechaInput.addEventListener("change", actualizarHorasDisponibles);

function setMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = "form-msg" + (type ? ` is-${type}` : "");
}

function construirMensajeWhatsapp({ nombre, telefono, servicioLabel, precio, fecha, hora }) {
  const fechaLegible = parseFechaLocal(fecha).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const texto =
    `Hola, soy ${nombre}. Quiero confirmar mi cita en La Oficina Barbería:\n` +
    `Servicio: ${servicioLabel} (${formatCOP(precio)})\n` +
    `Fecha: ${fechaLegible}\n` +
    `Hora: ${hora}\n` +
    `Teléfono: ${telefono}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("", null);

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const servicioKey = servicioSelect.value;
  const fecha = fechaInput.value;
  const hora = horaSelect.value;

  if (!nombre || !telefono || !servicioKey || !fecha || !hora) {
    setMsg("Por favor completa todos los campos.", "error");
    return;
  }

  const servicio = SERVICES[servicioKey];
  btnAgendar.disabled = true;
  btnAgendar.textContent = "Agendando...";

  try {
    const q = query(
      collection(db, CITAS_COLLECTION),
      where("fecha", "==", fecha),
      where("hora", "==", hora),
      where("estado", "in", ["pendiente", "confirmada"])
    );
    const existentes = await getDocs(q);
    if (!existentes.empty) {
      setMsg("Ese horario ya fue reservado, por favor elige otra hora.", "error");
      await actualizarHorasDisponibles();
      return;
    }

    await addDoc(collection(db, CITAS_COLLECTION), {
      nombre,
      telefono,
      servicio: servicioKey,
      servicioLabel: servicio.label,
      precio: servicio.precio,
      fecha,
      hora,
      estado: "pendiente",
      creadoEn: serverTimestamp(),
    });

    setMsg("¡Cita agendada! Te llevamos a WhatsApp para confirmar...", "success");

    const url = construirMensajeWhatsapp({
      nombre,
      telefono,
      servicioLabel: servicio.label,
      precio: servicio.precio,
      fecha,
      hora,
    });
    window.open(url, "_blank");

    form.reset();
    await actualizarHorasDisponibles();
  } catch (err) {
    console.error(err);
    setMsg("Ocurrió un error al agendar. Intenta de nuevo.", "error");
  } finally {
    btnAgendar.disabled = false;
    btnAgendar.textContent = "Confirmar y enviar a WhatsApp";
  }
});
