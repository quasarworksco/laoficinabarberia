// Configuración general del sitio: WhatsApp, horarios y servicios.
// Edita este archivo para ajustar precios u horarios sin tocar el resto del código.

// Número de WhatsApp de la barbería en formato internacional sin "+" ni espacios (ej: 573001234567)
export const WHATSAPP_NUMBER = "573232821398";

// Nombre de la colección en Firestore donde se guardan las citas
export const CITAS_COLLECTION = "citas";

// Horario de atención
export const BUSINESS_HOURS = {
  start: "09:00", // primer turno
  end: "21:00", // último turno (el local cierra una hora después, a las 10:00 p.m.)
  slotMinutes: 60,
  // 0 = domingo, 1 = lunes ... 6 = sábado
  openDays: [0, 1, 2, 3, 4, 5, 6],
};

// Servicios y precios (COP)
export const SERVICES = {
  corte: { label: "Corte", precio: 20000 },
  barba: { label: "Barba", precio: 10000 },
  corte_barba: { label: "Corte + Barba", precio: 30000 },
};

// Planes de suscripción para clientes frecuentes (COP)
export const SUBSCRIPTIONS = {
  meses3: { label: "Suscripción 3 meses", meses: 3, precio: 200000 },
  meses6: { label: "Suscripción 6 meses", meses: 6, precio: 450000 },
  meses9: { label: "Suscripción 9 meses", meses: 9, precio: 660000 },
};

export function formatCOP(valor) {
  const texto = valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  // Quita el espacio que algunos navegadores insertan entre "$" y el monto,
  // para que coincida con el formato "$20.000" usado en el resto del sitio.
  return texto.replace(/\s/g, "");
}
