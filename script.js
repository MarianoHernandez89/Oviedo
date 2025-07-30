const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
const modal = document.getElementById('carrito-modal');
const modalContent = document.getElementById('carrito-items');
const nombreInput = document.getElementById('nombre');
const entregaInput = document.getElementById('entrega');
const metodoPagoInputs = document.getElementsByName('metodo-pago');
const enviarPedidoBtn = document.getElementById('enviar-pedido');
const cerrarModalBtn = document.getElementById('cerrar-modal');

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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
      const productosHTML = productos.split(',').map(prod => `<li>${prod.trim()}</li>`).join('');
      const precio = parseFloat(combo.Precio || combo.precio || 0);

      card.innerHTML = `
        <div class="h-40 bg-cover bg-center" style="background-image: url('${imagenUrl}')"></div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">${nombre}</h2>
          <ul class="text-sm mb-2 list-disc list-inside">${productosHTML}</ul>
          <p class="text-lg font-semibold text-red-700">$${precio.toLocaleString('es-AR')}</p>
          <button class="mt-2 bg-red-700 text-white px-3 py-1 rounded add-to-cart">Agregar al carrito</button>
        </div>
      `;

      card.querySelector('.add-to-cart').addEventListener('click', () => {
        carrito.push({ nombre, precio, productos });
        localStorage.setItem('carrito', JSON.stringify(carrito));
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
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  totalSpan.textContent = total.toLocaleString('es-AR');
}

function renderizarCarrito() {
  modalContent.innerHTML = '';
  carrito.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'mb-4 border-b pb-2';
    const productosHTML = item.productos.split(',').map(prod => `<li>${prod.trim()}</li>`).join('');
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <p class="font-bold">${item.nombre}</p>
          <ul class="text-sm list-disc list-inside">${productosHTML}</ul>
          <p class="text-red-600">$${item.precio.toLocaleString('es-AR')}</p>
        </div>
        <button class="text-red-500 ml-4" onclick="eliminarDelCarrito(${index})">Eliminar</button>
      </div>
    `;
    modalContent.appendChild(div);
  });
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarTotal();
  renderizarCarrito();
}

document.getElementById('ver-carrito').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }
  renderizarCarrito();
  modal.classList.remove('hidden');
});

cerrarModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

enviarPedidoBtn.addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const nombre = nombreInput.value.trim();
  const entrega = entregaInput.value.trim();
  const metodoPago = Array.from(metodoPagoInputs).find(r => r.checked)?.value;

  if (!nombre || !entrega || !metodoPago) {
    alert('Por favor, completá todos los campos.');
    return;
  }

  let mensaje = `*Pedido de Combos de Carnicería*\n\n`;
  mensaje += `*Cliente:* ${nombre}\n`;
  mensaje += `*Entrega:* ${entrega}\n`;
  mensaje += `*Método de pago:* ${metodoPago}\n\n`;

  carrito.forEach(item => {
    mensaje += `*${item.nombre}* - $${item.precio.toLocaleString('es-AR')}\n`;
    const productos = item.productos.split(',').map(p => p.trim());
    productos.forEach(prod => mensaje += `  - ${prod}\n`);
    mensaje += `\n`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  mensaje += `*Total:* $${total.toLocaleString('es-AR')}`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  carrito = [];
  localStorage.removeItem('carrito');
  actualizarTotal();
  modal.classList.add('hidden');
  nombreInput.value = '';
  entregaInput.value = '';
  metodoPagoInputs.forEach(r => r.checked = false);
});
