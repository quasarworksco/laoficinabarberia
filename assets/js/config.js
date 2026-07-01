// Configuración general del sitio: WhatsApp, horarios y servicios.
// Edita este archivo para ajustar precios u horarios sin tocar el resto del código.

// Número de WhatsApp de la barbería en formato internacional sin "+" ni espacios (ej: 573001234567)
export const WHATSAPP_NUMBER = "573000000000";

// Nombre de la colección en Firestore donde se guardan las citas
export const CITAS_COLLECTION = "citas";

// Horario de atención
export const BUSINESS_HOURS = {
  start: "09:00",
  end: "19:00",
  slotMinutes: 30,
  // 0 = domingo, 1 = lunes ... 6 = sábado
  openDays: [1, 2, 3, 4, 5, 6],
};

// Servicios y precios (COP)
export const SERVICES = {
  corte: { label: "Corte", precio: 20000 },
  barba: { label: "Barba", precio: 10000 },
  corte_barba: { label: "Corte + Barba", precio: 30000 },
};

export function formatCOP(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
