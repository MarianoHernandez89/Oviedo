const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
const carritoModal = document.getElementById('carrito-modal');
const cerrarCarritoBtn = document.getElementById('cerrar-carrito');
const carritoItemsContainer = document.getElementById('carrito-items');
const enviarPedidoBtn = document.getElementById('enviar-pedido');

let carrito = [];
let combosData = [];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    combosData = data;

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
        carrito.push({ nombre, precio, productos });
        actualizarTotal();
      });

      combosContainer.appendChild(card);
    });

    actualizarTotal();
  })
  .catch(error => {
    console.error('Error al cargar los datos:', error);
  });

function actualizarTotal() {
  totalSpan.textContent = carrito.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-AR');
}

document.getElementById('ver-carrito').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  renderizarCarrito();
  carritoModal.classList.remove('hidden');
});

cerrarCarritoBtn.addEventListener('click', () => {
  carritoModal.classList.add('hidden');
});

enviarPedidoBtn.addEventListener('click', () => {
  const nombre = document.getElementById('nombre-cliente').value.trim();
  const direccion = document.getElementById('direccion-entrega').value.trim();
  const formaPago = document.querySelector('input[name="forma-pago"]:checked');

  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  if (!nombre || !direccion || !formaPago) {
    alert('Por favor completá todos los campos y seleccioná una forma de pago.');
    return;
  }

  const mensaje = `*Nuevo Pedido*%0A
👤 *Nombre:* ${nombre}%0A📍 *Entrega:* ${direccion}%0A💳 *Pago:* ${formaPago.value}%0A%0A🛒 *Productos:*%0A${carrito.map(item => `- ${item.nombre}: $${item.precio.toLocaleString('es-AR')} (%0A  Contiene: ${item.productos})`).join('%0A')}%0A%0A💰 *Total:* $${carrito.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-AR')}`;

  const url = `https://wa.me/?text=${mensaje}`;
  window.open(url, '_blank');
});

function renderizarCarrito() {
  carritoItemsContainer.innerHTML = '';
  carrito.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'mb-2 flex justify-between items-center';
    li.innerHTML = `
      <span>${item.nombre} - $${item.precio.toLocaleString('es-AR')}</span>
      <button class="text-red-700" onclick="eliminarItem(${index})">Eliminar</button>
    `;
    carritoItemsContainer.appendChild(li);
  });
  actualizarTotal();
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  renderizarCarrito();
}
