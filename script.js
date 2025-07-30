const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
let carrito = []; // se limpia en cada recarga

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
        carrito.push({ nombre, precio });
        actualizarTotal();
      });

      combosContainer.appendChild(card);
    });

    actualizarTotal();
  })
  .catch(error => console.error('Error al cargar los datos:', error));

function actualizarTotal() {
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  totalSpan.textContent = total.toLocaleString('es-AR');
}

document.getElementById('ver-carrito').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const carritoContainer = document.createElement('div');
  carritoContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

  const modal = document.createElement('div');
  modal.className = 'bg-white p-6 rounded shadow-md max-w-md w-full relative';

  const listaItems = carrito.map((item, index) => `
    <li class="flex justify-between items-center my-2">
      <span>${item.nombre} - $${item.precio.toLocaleString('es-AR')}</span>
      <button data-index="${index}" class="text-red-600 hover:text-red-800 eliminar-item">🗑️</button>
    </li>
  `).join('');

  modal.innerHTML = `
    <h2 class="text-xl font-bold mb-4">🛒 Tu Carrito</h2>
    <ul>${listaItems}</ul>
    <p class="mt-4 font-bold">Total: $${carrito.reduce((sum, i) => sum + i.precio, 0).toLocaleString('es-AR')}</p>
    <div class="mt-4 flex justify-end gap-2">
      <button id="cancelar" class="px-4 py-2 border rounded">Cancelar</button>
      <button id="confirmar" class="px-4 py-2 bg-green-600 text-white rounded">Enviar Pedido</button>
    </div>
  `;

  carritoContainer.appendChild(modal);
  document.body.appendChild(carritoContainer);

  // Eliminar ítems del carrito
  modal.querySelectorAll('.eliminar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      carrito.splice(index, 1);
      document.body.removeChild(carritoContainer);
      actualizarTotal();
      document.getElementById('ver-carrito').click(); // Volver a abrir modal actualizado
    });
  });

  modal.querySelector('#cancelar').addEventListener('click', () => {
    document.body.removeChild(carritoContainer);
  });

  modal.querySelector('#confirmar').addEventListener('click', () => {
    const metodoPago = prompt('¿Cómo desea pagar? (Efectivo o MercadoPago)').trim();
    if (!metodoPago || (metodoPago.toLowerCase() !== 'efectivo' && metodoPago.toLowerCase() !== 'mercadopago')) {
      alert('Método de pago inválido.');
      return;
    }

    const resumen = carrito.map(i => `• ${i.nombre} - $${i.precio.toLocaleString('es-AR')}`).join('%0A');
    const total = carrito.reduce((sum, i) => sum + i.precio, 0);
    const mensaje = `Hola! Quisiera hacer el siguiente pedido:%0A%0A${resumen}%0A%0ATotal: $${total.toLocaleString('es-AR')}.%0AMétodo de pago: ${metodoPago}`;

    const numeroWhatsApp = '549XXXXXXXXXX'; // Reemplazá por tu número con código de país y sin símbolos
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

    window.open(url, '_blank');

    // Vaciar carrito después de enviar
    carrito = [];
    actualizarTotal();
    document.body.removeChild(carritoContainer);
  });
});
