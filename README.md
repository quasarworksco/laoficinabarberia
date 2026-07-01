# La Oficina Barbería

Sitio web para agendamiento de citas de La Oficina Barbería, con landing page pública y panel administrativo.

## Estructura

```
index.html              Landing page (servicios, precios y formulario de citas)
admin/index.html         Panel administrativo (citas del día + métricas)
assets/css/style.css     Estilos de la landing (compartidos con el admin)
assets/js/config.js      Configuración del sitio: WhatsApp, horario y precios
assets/js/firebase-config.js  Credenciales de Firebase (completar antes de usar)
assets/js/app.js         Lógica de la landing (formulario, disponibilidad, WhatsApp)
admin/css/admin.css      Estilos propios del panel admin
admin/js/admin.js        Lógica del panel admin (tiempo real con Firestore)
firestore.rules          Reglas de seguridad sugeridas para Firestore
```

Es un sitio 100% estático (HTML + JS con módulos ES + Firebase SDK vía CDN). No requiere build ni Node — se puede desplegar en Firebase Hosting, Netlify, Vercel o GitHub Pages.

## Configuración inicial

### 1. Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Firestore Database** (modo producción).
3. En "Configuración del proyecto" > "Tus apps", crea una app web y copia las credenciales.
4. Pega esas credenciales en `assets/js/firebase-config.js`.
5. Publica las reglas de `firestore.rules` en Firestore (pestaña "Reglas").

### 2. WhatsApp y horario

Edita `assets/js/config.js`:

- `WHATSAPP_NUMBER`: número de WhatsApp de la barbería en formato internacional sin `+` (ej: `573001234567`).
- `BUSINESS_HOURS`: horario de atención y duración de cada cita (por defecto Lun-Sáb 9:00am-7:00pm, cada 30 min).
- `SERVICES`: nombre y precio de cada servicio (Corte $20.000, Barba $10.000, Corte + Barba $30.000).

## Cómo funciona

**Landing (`index.html`)**
- El cliente elige servicio, fecha y hora (solo se muestran horas dentro del horario de atención que aún no estén ocupadas ese día).
- Al enviar el formulario se crea un documento en la colección `citas` de Firestore con estado `pendiente`.
- Inmediatamente se abre WhatsApp (`wa.me`) con un mensaje prellenado hacia el número de la barbería, para que el cliente confirme la cita.

**Admin (`admin/index.html`)**
- Muestra en tiempo real las citas del día seleccionado (por defecto, hoy).
- Métricas: total de citas, ingresos estimados, completadas, pendientes, y desglose por tipo de servicio, además de la próxima cita.
- Acciones por cita: marcar como completada, cancelar, eliminar, o abrir WhatsApp directo con el cliente.

## Nota de seguridad importante

Por decisión del setup inicial, **el panel `/admin` no tiene autenticación** y las reglas de Firestore permiten actualizar/eliminar citas sin login. Esto es aceptable solo mientras el sitio no esté en producción pública. Antes de lanzarlo:

1. Habilita **Firebase Authentication** (email/contraseña).
2. Agrega una pantalla de login en `admin/index.html`.
3. Cambia en `firestore.rules` la línea de `update, delete` a `if request.auth != null;`.

## Modelo de datos (colección `citas`)

```json
{
  "nombre": "Juan Pérez",
  "telefono": "3001234567",
  "servicio": "corte",
  "servicioLabel": "Corte",
  "precio": 20000,
  "fecha": "2026-07-05",
  "hora": "10:30",
  "estado": "pendiente",
  "creadoEn": "Timestamp"
}
```

`estado` puede ser: `pendiente`, `confirmada`, `completada` o `cancelada`.
