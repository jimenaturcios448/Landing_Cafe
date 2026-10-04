const menu = {
  cafe: [
    { nombre: "Espresso", desc: "Doble shot, notas de chocolate y caramelo.", precio: 2.5 },
    { nombre: "Flat White", desc: "Espresso con leche texturizada y suave.", precio: 3.5 },
    { nombre: "Capuchino", desc: "Espresso, leche vaporizada y espuma cremosa.", precio: 3.75 },
    { nombre: "V60 de origen", desc: "Café filtrado, el origen cambia cada semana.", precio: 4.25 },
  ],
  frio: [
    { nombre: "Cold Brew", desc: "Infusión en frío por 18 horas, muy suave.", precio: 3.75 },
    { nombre: "Espresso Tonic", desc: "Espresso sobre agua tónica y rodaja de naranja.", precio: 4.25 },
    { nombre: "Frappé de Caramelo", desc: "Café frío licuado con caramelo y crema.", precio: 4.5 },
    { nombre: "Limonada de Hierbabuena", desc: "Limón natural y hierbabuena fresca.", precio: 3.0 },
  ],
  dulce: [
    { nombre: "Croissant de Mantequilla", desc: "Horneado cada mañana, hojaldrado y dorado.", precio: 2.75 },
    { nombre: "Cheesecake de Frutos Rojos", desc: "Cremoso, con base de galleta artesanal.", precio: 4.5 },
    { nombre: "Brownie de Chocolate", desc: "Intenso, con nueces y sal marina.", precio: 3.25 },
    { nombre: "Pan de Banano", desc: "Casero, tibio y con un toque de canela.", precio: 2.5 },
  ],
};

const CLAVE_RESERVAS = "ambar-reservas";

let carrito = {};
let reservas = cargarReservas();
let ultimaId = null;

const contenedor = document.getElementById("items");
const tabs = document.querySelectorAll(".tab");
const panel = document.getElementById("carrito");
const fondo = document.getElementById("fondo");
const resumen = document.getElementById("resumen");
const form = document.getElementById("form");
const listaReservas = document.getElementById("listaReservas");

const formato = (n) => "$" + n.toFixed(2);

function crearEl(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/* ---------- Modal de confirmación ---------- */
const modal = document.getElementById("modal");
let resolverModal = null;

function confirmar({ titulo, texto, aceptar = "Sí, eliminar", cancelar = "Mantener" }) {
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalTexto").textContent = texto;
  document.getElementById("modalAceptar").textContent = aceptar;
  document.getElementById("modalCancelar").textContent = cancelar;

  modal.classList.add("abierto");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("modalCancelar").focus();

  return new Promise((resolver) => {
    resolverModal = resolver;
  });
}

function cerrarModal(resultado) {
  modal.classList.remove("abierto");
  modal.setAttribute("aria-hidden", "true");
  if (resolverModal) {
    resolverModal(resultado);
    resolverModal = null;
  }
}

document.getElementById("modalAceptar").addEventListener("click", () => cerrarModal(true));
document.getElementById("modalCancelar").addEventListener("click", () => cerrarModal(false));
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("abierto")) cerrarModal(false);
});

/* ---------- Menú ---------- */
function mostrar(categoria) {
  contenedor.innerHTML = "";
  menu[categoria].forEach((p, i) => {
    const item = document.createElement("article");
    item.className = "item";
    item.style.animationDelay = `${i * 0.07}s`;

    const info = document.createElement("div");
    info.innerHTML = `<h3>${p.nombre}</h3><p>${p.desc}</p>`;

    const lado = document.createElement("div");
    lado.className = "lado";
    lado.innerHTML = `<span class="precio">${formato(p.precio)}</span>`;

    const btn = document.createElement("button");
    btn.className = "agregar";
    btn.textContent = "+";
    btn.setAttribute("aria-label", `Agregar ${p.nombre}`);
    btn.addEventListener("click", () => agregar(p));

    lado.appendChild(btn);
    item.append(info, lado);
    contenedor.appendChild(item);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("activa"));
    tab.classList.add("activa");
    mostrar(tab.dataset.cat);
  });
});

/* ---------- Carrito ---------- */
function agregar(p) {
  if (!carrito[p.nombre]) carrito[p.nombre] = { ...p, cant: 0 };
  carrito[p.nombre].cant++;
  actualizarCarrito();

  const boton = document.getElementById("abrirCarrito");
  boton.classList.remove("rebote");
  void boton.offsetWidth; // reinicia la animación
  boton.classList.add("rebote");
}

function cambiarCantidad(nombre, delta) {
  carrito[nombre].cant += delta;
  if (carrito[nombre].cant <= 0) delete carrito[nombre];
  actualizarCarrito();
}

function totales() {
  const lista = Object.values(carrito);
  return {
    lista,
    cantidad: lista.reduce((suma, p) => suma + p.cant, 0),
    total: lista.reduce((suma, p) => suma + p.cant * p.precio, 0),
  };
}

function actualizarCarrito() {
  const { lista, cantidad, total } = totales();
  document.getElementById("cuenta").textContent = cantidad;
  document.getElementById("total").textContent = formato(total);

  const cont = document.getElementById("carritoItems");
  cont.innerHTML = "";

  if (!lista.length) {
    cont.innerHTML = '<p class="vacio">Aún no has agregado nada.</p>';
    return;
  }

  lista.forEach((p) => {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.innerHTML = `
      <div><strong>${p.nombre}</strong><span>${formato(p.precio * p.cant)}</span></div>
      <div class="cant">
        <button aria-label="Quitar uno">−</button>
        <span>${p.cant}</span>
        <button aria-label="Agregar uno">+</button>
      </div>`;
    const [menos, mas] = fila.querySelectorAll(".cant button");
    menos.addEventListener("click", () => cambiarCantidad(p.nombre, -1));
    mas.addEventListener("click", () => cambiarCantidad(p.nombre, 1));
    cont.appendChild(fila);
  });
}

function abrirPanel(abrir) {
  panel.classList.toggle("abierto", abrir);
  fondo.classList.toggle("abierto", abrir);
  panel.setAttribute("aria-hidden", String(!abrir));
}

document.getElementById("abrirCarrito").addEventListener("click", () => abrirPanel(true));
document.getElementById("cerrarCarrito").addEventListener("click", () => abrirPanel(false));
fondo.addEventListener("click", () => abrirPanel(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") abrirPanel(false);
});

document.getElementById("vaciar").addEventListener("click", () => {
  carrito = {};
  actualizarCarrito();
});

/* ---------- Resumen del pedido en el formulario ---------- */
function mostrarResumen() {
  const { lista, total } = totales();
  if (!lista.length) {
    resumen.hidden = true;
    resumen.innerHTML = "";
    return;
  }
  resumen.hidden = false;
  resumen.innerHTML =
    "<strong>Tu pedido anticipado</strong>" +
    lista
      .map((p) => `<div><span>${p.cant} × ${p.nombre}</span><span>${formato(p.cant * p.precio)}</span></div>`)
      .join("") +
    `<div class="resumen-total"><span>Total</span><span>${formato(total)}</span></div>`;
}

document.getElementById("continuar").addEventListener("click", () => {
  mostrarResumen();
  abrirPanel(false);
  document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
});

/* ---------- Reservas ---------- */
function cargarReservas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RESERVAS)) || [];
  } catch {
    return [];
  }
}

function guardarReservas() {
  try {
    localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
  } catch {
    /* si el navegador bloquea el almacenamiento, la demo sigue funcionando */
  }
}

function fechaLegible(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderReservas() {
  const badge = document.getElementById("badgeReservas");
  badge.textContent = reservas.length;
  badge.hidden = reservas.length === 0;
  document.getElementById("eliminarTodas").hidden = reservas.length === 0;

  document.getElementById("subReservas").textContent = reservas.length
    ? `${reservas.length} reserva(s) registrada(s)`
    : "";

  listaReservas.innerHTML = "";

  if (!reservas.length) {
    listaReservas.appendChild(
      crearEl("p", "sin-reservas", "Todavía no hay reservas. ¡Haz la primera desde el formulario!")
    );
    return;
  }

  const ordenadas = [...reservas].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.creada - b.creada
  );

  ordenadas.forEach((r) => {
    const card = crearEl("article", "reserva" + (r.id === ultimaId ? " nueva" : ""));

    const cab = crearEl("div", "reserva-cab");
    cab.append(
      crearEl("h3", null, r.nombre),
      crearEl(
        "span",
        "etiqueta-tipo" + (r.pedido.length ? " con-pedido" : ""),
        r.pedido.length ? "Con pedido" : "Solo mesa"
      )
    );

    const datos = crearEl("div", "reserva-datos");
    datos.append(
      crearEl("div", null, "📅 " + fechaLegible(r.fecha)),
      crearEl("div", null, `👥 ${r.personas} persona(s)`),
      crearEl("div", null, "✉️ " + r.correo)
    );
    if (r.notas) datos.append(crearEl("div", null, "📝 " + r.notas));

    card.append(cab, datos);

    if (r.pedido.length) {
      const ped = crearEl("div", "reserva-pedido");
      r.pedido.forEach((p) => {
        const fila = crearEl("div");
        fila.append(
          crearEl("span", null, `${p.cant} × ${p.nombre}`),
          crearEl("span", null, formato(p.cant * p.precio))
        );
        ped.appendChild(fila);
      });
      const totalFila = crearEl("div", "reserva-total");
      totalFila.append(crearEl("span", null, "Total"), crearEl("span", null, formato(r.total)));
      ped.appendChild(totalFila);
      card.appendChild(ped);
    }

    const cancelar = crearEl("button", "cancelar", "🗑 Eliminar reserva");
    cancelar.addEventListener("click", async () => {
      const ok = await confirmar({
        titulo: "¿Eliminar reserva?",
        texto: `Se eliminará la reserva de ${r.nombre}. Esta acción no se puede deshacer.`,
      });
      if (!ok) return;

      cancelar.disabled = true;
      card.classList.add("saliendo");
      setTimeout(() => {
        reservas = reservas.filter((x) => x.id !== r.id);
        guardarReservas();
        renderReservas();
      }, 300);
    });
    card.appendChild(cancelar);

    listaReservas.appendChild(card);
  });
}

document.getElementById("eliminarTodas").addEventListener("click", async () => {
  const ok = await confirmar({
    titulo: "¿Eliminar todas las reservas?",
    texto: "Se borrarán todas las reservas registradas. Esta acción no se puede deshacer.",
    aceptar: "Sí, eliminar todas",
  });
  if (!ok) return;

  reservas = [];
  guardarReservas();
  renderReservas();
});

// No permitir fechas pasadas
const hoy = new Date();
document.getElementById("fechaReserva").min =
  `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { lista, cantidad, total } = totales();

  const reserva = {
    id: Date.now().toString(),
    creada: Date.now(),
    nombre: document.getElementById("nombre").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    fecha: document.getElementById("fechaReserva").value,
    personas: Number(document.getElementById("personas").value),
    notas: document.getElementById("notas").value.trim(),
    pedido: lista.map(({ nombre, cant, precio }) => ({ nombre, cant, precio })),
    total,
  };

  reservas.push(reserva);
  ultimaId = reserva.id;
  guardarReservas();

  document.getElementById("mensaje").textContent = cantidad
    ? `¡Gracias! Reserva registrada con ${cantidad} producto(s) por ${formato(total)}.`
    : "¡Gracias! Tu reserva quedó registrada.";

  form.reset();
  carrito = {};
  actualizarCarrito();
  mostrarResumen();
  renderReservas();

  document.getElementById("reservas").scrollIntoView({ behavior: "smooth" });
});

/* ---------- Navegación y animaciones ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observador.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observador.observe(el));

/* ---------- Inicio ---------- */
mostrar("cafe");
actualizarCarrito();
renderReservas();