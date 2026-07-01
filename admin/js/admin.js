import { db } from "../../assets/js/firebase-config.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { CITAS_COLLECTION, WHATSAPP_NUMBER, formatCOP } from "../../assets/js/config.js";

const fechaFiltro = document.getElementById("fecha-filtro");
const btnHoy = document.getElementById("btn-hoy");
const tbody = document.getElementById("citas-tbody");

const mTotal = document.getElementById("m-total");
const mIngresos = document.getElementById("m-ingresos");
const mCompletadas = document.getElementById("m-completadas");
const mPendientes = document.getElementById("m-pendientes");
const mCortes = document.getElementById("m-cortes");
const mBarbas = document.getElementById("m-barbas");
const mCombos = document.getElementById("m-combos");
const mProxima = document.getElementById("m-proxima");

let unsubscribe = null;

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function estadoLabel(estado) {
  const labels = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return labels[estado] || estado;
}

function render(citas) {
  if (citas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="citas-empty">No hay citas agendadas para este día.</td></tr>`;
  } else {
    tbody.innerHTML = citas
      .map((cita) => {
        const disabledCompletar = cita.estado === "completada" || cita.estado === "cancelada";
        const disabledCancelar = cita.estado === "cancelada" || cita.estado === "completada";
        return `
        <tr data-id="${cita.id}">
          <td>${cita.hora}</td>
          <td>${escapeHtml(cita.nombre)}</td>
          <td>${escapeHtml(cita.telefono)}</td>
          <td>${escapeHtml(cita.servicioLabel || cita.servicio)}</td>
          <td>${formatCOP(cita.precio || 0)}</td>
          <td><span class="estado-pill estado-${cita.estado}">${estadoLabel(cita.estado)}</span></td>
          <td>
            <div class="accion-btns">
              <button class="btn-whatsapp" data-action="whatsapp" title="Escribir por WhatsApp">WA</button>
              <button class="btn-completar" data-action="completar" ${disabledCompletar ? "disabled" : ""}>Completar</button>
              <button class="btn-cancelar" data-action="cancelar" ${disabledCancelar ? "disabled" : ""}>Cancelar</button>
              <button class="btn-eliminar" data-action="eliminar">Eliminar</button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  }

  actualizarMetricas(citas);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function actualizarMetricas(citas) {
  const activas = citas.filter((c) => c.estado !== "cancelada");
  const completadas = citas.filter((c) => c.estado === "completada");
  const pendientes = citas.filter((c) => c.estado === "pendiente" || c.estado === "confirmada");
  const ingresos = activas.reduce((sum, c) => sum + (c.precio || 0), 0);

  mTotal.textContent = citas.length;
  mIngresos.textContent = formatCOP(ingresos);
  mCompletadas.textContent = completadas.length;
  mPendientes.textContent = pendientes.length;
  mCortes.textContent = citas.filter((c) => c.servicio === "corte").length;
  mBarbas.textContent = citas.filter((c) => c.servicio === "barba").length;
  mCombos.textContent = citas.filter((c) => c.servicio === "corte_barba").length;

  const ahora = new Date();
  const esHoy = fechaFiltro.value === toDateInputValue(ahora);
  const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();

  const proxima = pendientes
    .filter((c) => {
      if (!esHoy) return true;
      const [h, m] = c.hora.split(":").map(Number);
      return h * 60 + m >= ahoraMinutos;
    })
    .sort((a, b) => a.hora.localeCompare(b.hora))[0];

  mProxima.textContent = proxima ? proxima.hora : "--:--";
}

function suscribirse(fechaStr) {
  if (unsubscribe) unsubscribe();
  tbody.innerHTML = `<tr><td colspan="7" class="citas-empty">Cargando citas...</td></tr>`;

  const q = query(collection(db, CITAS_COLLECTION), where("fecha", "==", fechaStr));
  unsubscribe = onSnapshot(
    q,
    (snap) => {
      const citas = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.hora.localeCompare(b.hora));
      render(citas);
    },
    (err) => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="7" class="citas-empty">Error al cargar las citas. Revisa la configuración de Firebase.</td></tr>`;
    }
  );
}

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const row = btn.closest("tr");
  const id = row.dataset.id;
  const action = btn.dataset.action;
  const citaRef = doc(db, CITAS_COLLECTION, id);

  try {
    if (action === "completar") {
      await updateDoc(citaRef, { estado: "completada" });
    } else if (action === "cancelar") {
      await updateDoc(citaRef, { estado: "cancelada" });
    } else if (action === "eliminar") {
      if (confirm("¿Eliminar esta cita permanentemente?")) {
        await deleteDoc(citaRef);
      }
    } else if (action === "whatsapp") {
      const telefono = row.children[2].textContent.replace(/\D/g, "");
      window.open(`https://wa.me/${telefono || WHATSAPP_NUMBER}`, "_blank");
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo completar la acción. Intenta de nuevo.");
  }
});

fechaFiltro.addEventListener("change", () => suscribirse(fechaFiltro.value));
btnHoy.addEventListener("click", () => {
  fechaFiltro.value = toDateInputValue(new Date());
  suscribirse(fechaFiltro.value);
});

fechaFiltro.value = toDateInputValue(new Date());
suscribirse(fechaFiltro.value);
