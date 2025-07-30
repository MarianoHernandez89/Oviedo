const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
const carritoModal = document.getElementById('carrito-modal');
const carritoContenido = document.getElementById('carrito-contenido');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const enviarPedidoBtn = document.getElementById('enviar-pedido');
const nombreInput = document.getElementById('nombre');
const entregaInput = document.getElementById('entrega');
const pagoInputs = document.getElementsByName('pago');

let carrito = [];

function limpiarCarrito() {
  carrito = [];
  actualizarTotal();
  localStorage.removeItem('carrito');
}

fetch(URL)
  .then(res => res.json())
  .then(data => {
    data.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'rounded overflow-hidden shadow-lg bg-white relative';

      const imagenUrl = combo.Imagen || combo.imagen || '';
      const nombre = combo.Nombre || combo.nombre || 'Sin nombre';
      const productos = combo.Productos || combo.productos || '';
      const precio = parseFloat(combo.Precio || combo.precio || 0);

      card.innerHTML = `
        <div class="h-40 bg-cover bg-center" style="background-image: url('${imagenUrl}')"></div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">${nombre}</h2>
          <p class="text-sm mb-2">${productos}</p>
          <p class="text-lg font-semibold text-red-700">$${precio.toLocaleString('es-AR')}</p>
          <button class="mt-2 bg-red-700 text-white px-3 py-1 rounded add-to-cart">Agregar al carrito</button>
        </div>
      `;

      card.querySelector('.add-to-cart').addEventListener('click', () => {
        carrito.push({ nombre, productos, precio });
        actualizarTotal();
      });

      combosContainer.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Error al cargar los datos:', error);
  });

function actualizarTotal() {
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  totalSpan.textContent = total.toLocaleString('es-AR');
  renderizarCarrito();
}

function renderizarCarrito() {
  carritoContenido.innerHTML = '';

  if (carrito.length === 0) {
    carritoContenido.innerHTML = '<p class="text-center">El carrito está vacío.</p>';
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'border-b py-2 flex justify-between items-start';
    div.innerHTML = `
      <div>
        <p class="font-bold">${item.nombre}</p>
        <p class="text-sm text-gray-600">${item.productos}</p>
        <p class="text-red-700 font-semibold">$${item.precio.toLocaleString('es-AR')}</p>
      </div>
      <button class="text-red-500 text-sm" onclick="eliminarDelCarrito(${index})">🗑️</button>
    `;
    carritoContenido.appendChild(div);
  });
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarTotal();
}

document.getElementById('ver-carrito').addEventListener('click', () => {
  carritoModal.classList.remove('hidden');
});

cerrarCarrito.addEventListener('click', () => {
  carritoModal.classList.add('hidden');
});

enviarPedidoBtn.addEventListener('click', () => {
  const nombre = nombreInput.value.trim();
  const entrega = entregaInput.value.trim();
  const metodoPago = [...pagoInputs].find(r => r.checked)?.value;

  if (!nombre || !entrega || !metodoPago) {
    alert('Por favor, complete todos los campos.');
    return;
  }

  if (carrito.length === 0) {
    alert('El carrito está vacío. Agregue al menos un combo.');
    return;
  }

  const detalle = carrito.map(item => `- ${item.nombre}\n  (${item.productos})\n  $${item.precio.toLocaleString('es-AR')}`).join('\n\n');
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  const mensaje = `Hola! Quiero hacer un pedido:\n\n${detalle}\n\nTotal: $${total.toLocaleString('es-AR')}\n\nNombre: ${nombre}\nEntrega: ${entrega}\nForma de pago: ${metodoPago}`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  limpiarCarrito();
  carritoModal.classList.add('hidden');
});

// Limpiar carrito al recargar la página
window.addEventListener('beforeunload', () => {
  limpiarCarrito();
});
