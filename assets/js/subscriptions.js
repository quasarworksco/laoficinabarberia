import { WHATSAPP_NUMBER, SUBSCRIPTIONS, formatCOP } from "./config.js";

document.querySelectorAll("[data-plan]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = SUBSCRIPTIONS[btn.dataset.plan];
    if (!plan) return;

    const texto =
      `Hola, quiero información sobre la suscripción de ${plan.meses} meses ` +
      `(${formatCOP(plan.precio)}) en La Oficina Barbería.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, "_blank");
  });
});
