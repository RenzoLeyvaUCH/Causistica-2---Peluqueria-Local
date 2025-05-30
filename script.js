document.addEventListener("DOMContentLoaded", () => {
  // Validaciones reutilizables
  const esNombreValido = (nombre) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre);
  const esTelefonoValido = (telefono) => /^\d{9}$/.test(telefono);
  const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // === Agendar cita ===
  const formCita = document.getElementById("form-agendar");
  if (formCita) {
  formCita.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const servicio = document.getElementById("servicio").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const barbero = document.getElementById("barbero").value.trim();

    if (!nombre || !servicio || !fecha || !hora || !barbero) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (!esNombreValido(nombre)) {
      alert("El nombre solo debe contener letras y espacios.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(fecha) < hoy) {
      alert("No se permite agendar citas en fechas pasadas.");
      return;
    }

    // Mostrar resumen en modal
    const contenidoResumen = document.getElementById("contenido-resumen");
    contenidoResumen.innerHTML = `
      <ul>
        <li><strong>Nombre:</strong> ${nombre}</li>
        <li><strong>Servicio:</strong> ${servicio}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Hora:</strong> ${hora}</li>
        <li><strong>Barbero:</strong> ${barbero}</li>
      </ul>
    `;

    const modal = document.getElementById("modal-resumen");
    modal.style.display = "block";

    // Botón Cancelar
    document.getElementById("cancelar-cita").onclick = () => {
      modal.style.display = "none";
    };

    // Botón Confirmar
    document.getElementById("confirmar-cita").onclick = () => {
      if (confirm("¿Estás seguro de confirmar esta cita?")) {
        const cita = { id: Date.now(), nombre, servicio, fecha, hora, barbero };
        const citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas.push(cita);
        localStorage.setItem("citas", JSON.stringify(citas));

        modal.style.display = "none";
        formCita.reset();
        renderizarCitas();

        alert("✅ ¡Cita confirmada y registrada exitosamente!");
      }
    };
  });
}

  // === Mostrar y filtrar citas ===
  const tablaCitas = document.getElementById("tabla-citas");
  const filtroFecha = document.getElementById("filtro-fecha");
  const filtroBarbero = document.getElementById("filtro-barbero");
  const buscarCitasInput = document.getElementById("buscar-citas");

  function renderizarCitas() {
    if (!tablaCitas) return;
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const tbody = tablaCitas.querySelector("tbody");
    tbody.innerHTML = "";

    const fechaFiltro = filtroFecha ? filtroFecha.value : "";
    const barberoFiltro = filtroBarbero ? filtroBarbero.value.toLowerCase() : "";
    const busqueda = buscarCitasInput ? buscarCitasInput.value.toLowerCase() : "";

    const citasFiltradas = citas.filter((cita) => {
      const coincideFecha = fechaFiltro ? cita.fecha === fechaFiltro : true;
      const coincideBarbero = barberoFiltro
        ? cita.barbero.toLowerCase().includes(barberoFiltro)
        : true;
      const coincideBusqueda =
        cita.nombre.toLowerCase().includes(busqueda) ||
        cita.servicio.toLowerCase().includes(busqueda) ||
        cita.barbero.toLowerCase().includes(busqueda) ||
        cita.fecha.includes(busqueda);

      return coincideFecha && coincideBarbero && coincideBusqueda;
    });

    citasFiltradas.forEach((cita) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cita.nombre}</td>
        <td>${cita.servicio}</td>
        <td>${cita.fecha}</td>
        <td>${cita.hora}</td>
        <td>${cita.barbero}</td>
        <td>
          <button onclick="editar(${cita.id})">Editar</button>
          <button onclick="eliminar(${cita.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (tablaCitas) {
    renderizarCitas();

    if (filtroFecha) filtroFecha.addEventListener("change", renderizarCitas);
    if (filtroBarbero) filtroBarbero.addEventListener("input", renderizarCitas);
    if (buscarCitasInput) buscarCitasInput.addEventListener("input", renderizarCitas);
  }

  // === Editar cita desde editar.html ===
  const formEditar = document.getElementById("formEditar");
  if (formEditar) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const cita = citas.find((c) => c.id == id);

    if (cita) {
      document.getElementById("editId").value = cita.id;
      document.getElementById("editNombre").value = cita.nombre;
      document.getElementById("editServicio").value = cita.servicio;
      document.getElementById("editFecha").value = cita.fecha;
      document.getElementById("editHora").value = cita.hora;
      document.getElementById("editBarbero").value = cita.barbero;
    }

    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editId").value;
      const nombre = document.getElementById("editNombre").value.trim();

      if (!esNombreValido(nombre)) {
        alert("El nombre solo debe contener letras y espacios.");
        return;
      }

      const index = citas.findIndex((c) => c.id == id);
      citas[index] = {
        id: Number(id),
        nombre,
        servicio: document.getElementById("editServicio").value.trim(),
        fecha: document.getElementById("editFecha").value,
        hora: document.getElementById("editHora").value,
        barbero: document.getElementById("editBarbero").value.trim(),
      };

      localStorage.setItem("citas", JSON.stringify(citas));
      alert("Cita actualizada.");
      window.location.href = "agenda.html";
    });
  }

  // === Funciones globales para editar y eliminar citas ===
  window.eliminar = function (id) {
    if (confirm("¿Estás seguro que deseas eliminar esta cita?")) {
      let citas = JSON.parse(localStorage.getItem("citas")) || [];
      citas = citas.filter((cita) => cita.id !== id);
      localStorage.setItem("citas", JSON.stringify(citas));
      renderizarCitas();
    }
  };

  window.editar = function (id) {
    window.location.href = `editar.html?id=${id}`;
  };

  // === Clientes frecuentes con búsqueda y edición inline ===
  const formClientes = document.getElementById("form-clientes");
  const tablaClientes = document.getElementById("tabla-clientes");
  const buscarClientesInput = document.getElementById("buscar-clientes");

  function cargarClientes() {
    if (!tablaClientes) return;
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const tbody = tablaClientes.querySelector("tbody");
    tbody.innerHTML = "";

    const busqueda = buscarClientesInput ? buscarClientesInput.value.toLowerCase() : "";

    const clientesFiltrados = clientes.filter((cliente) => {
      return (
        cliente.nombre.toLowerCase().includes(busqueda) ||
        cliente.telefono.includes(busqueda) ||
        cliente.email.toLowerCase().includes(busqueda)
      );
    });

    clientesFiltrados.forEach((cliente, index) => {
      const tr = document.createElement("tr");
      tr.dataset.index = index;

      tr.innerHTML = `
        <td class="td-nombre">${cliente.nombre}</td>
        <td class="td-telefono">${cliente.telefono}</td>
        <td class="td-email">${cliente.email}</td>
        <td class="td-acciones">
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("tr").forEach((tr) => {
      const index = parseInt(tr.dataset.index);
      const btnEditar = tr.querySelector(".btn-editar");
      const btnEliminar = tr.querySelector(".btn-eliminar");

      btnEditar.addEventListener("click", () => {
        if (btnEditar.textContent === "Editar") {
          activarEdicion(tr, index);
        } else {
          guardarEdicion(tr, index);
        }
      });

      btnEliminar.addEventListener("click", () => {
        eliminarCliente(index);
      });
    });
  }

  function activarEdicion(tr, index) {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const cliente = clientes[index];

    tr.querySelector(".td-nombre").innerHTML = `<input type="text" value="${cliente.nombre}" class="input-nombre" />`;
    tr.querySelector(".td-telefono").innerHTML = `<input type="text" value="${cliente.telefono}" class="input-telefono" maxlength="9" />`;
    tr.querySelector(".td-email").innerHTML = `<input type="email" value="${cliente.email}" class="input-email" />`;

    const tdAcciones = tr.querySelector(".td-acciones");
    tdAcciones.innerHTML = `
      <button class="btn-guardar">Guardar</button>
      <button class="btn-cancelar">Cancelar</button>
    `;

    tdAcciones.querySelector(".btn-guardar").addEventListener("click", () => {
      guardarEdicion(tr, index);
    });

    tdAcciones.querySelector(".btn-cancelar").addEventListener("click", () => {
      cargarClientes();
    });
  }

  function guardarEdicion(tr, index) {
    const inputNombre = tr.querySelector(".input-nombre").value.trim();
    const inputTelefono = tr.querySelector(".input-telefono").value.trim();
    const inputEmail = tr.querySelector(".input-email").value.trim();

    if (!inputNombre || !inputTelefono || !inputEmail) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (!esNombreValido(inputNombre)) {
      alert("El nombre solo debe contener letras y espacios.");
      return;
    }

    if (!esTelefonoValido(inputTelefono)) {
      alert("El teléfono debe contener solo números (9 dígitos).");
      return;
    }

    if (!esEmailValido(inputEmail)) {
      alert("Por favor ingrese un correo electrónico válido.");
      return;
    }

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes[index] = {
      nombre: inputNombre,
      telefono: inputTelefono,
      email: inputEmail,
    };

    localStorage.setItem("clientes", JSON.stringify(clientes));
    alert("Cliente actualizado exitosamente.");
    cargarClientes();
  }

  function eliminarCliente(index) {
    if (confirm("¿Estás seguro que deseas eliminar este cliente?")) {
      const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      clientes.splice(index, 1);
      localStorage.setItem("clientes", JSON.stringify(clientes));
      cargarClientes();
    }
  }

  if (formClientes && tablaClientes) {
    formClientes.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre-cliente").value.trim();
      const telefono = document.getElementById("telefono-cliente").value.trim();
      const email = document.getElementById("email-cliente").value.trim();

      if (!nombre || !telefono || !email) {
        alert("Todos los campos son obligatorios.");
        return;
      }

      if (!esNombreValido(nombre)) {
        alert("El nombre solo debe contener letras y espacios.");
        return;
      }

      if (!esTelefonoValido(telefono)) {
        alert("El teléfono debe contener solo números (9 dígitos).");
        return;
      }

      if (!esEmailValido(email)) {
        alert("Por favor ingrese un correo electrónico válido.");
        return;
      }

      const nuevoCliente = { nombre, telefono, email };
      const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      clientes.push(nuevoCliente);
      localStorage.setItem("clientes", JSON.stringify(clientes));

      formClientes.reset();
      cargarClientes();
    });

    if (buscarClientesInput) {
      buscarClientesInput.addEventListener("input", cargarClientes);
    }

    cargarClientes();
  }
});
