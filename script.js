const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
const modal = document.getElementById('modal-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const enviarBtn = document.getElementById('enviar-whatsapp');
const cancelarBtn = document.getElementById('cancelar');

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Eliminar carrito si se refresca
window.addEventListener('beforeunload', () => localStorage.removeItem('carrito'));

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
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarTotal();
      });

      combosContainer.appendChild(card);
    });
    actualizarTotal();
  });

function actualizarTotal() {
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  totalSpan.textContent = total.toLocaleString('es-AR');
}

document.getElementById('ver-carrito').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }
  mostrarCarrito();
});

function mostrarCarrito() {
  listaCarrito.innerHTML = '';
  carrito.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center border-b pb-1';
    li.innerHTML = `
      <span>${item.nombre} - $${item.precio.toLocaleString('es-AR')}</span>
      <button class="text-red-600" onclick="eliminarItem(${index})">✕</button>
    `;
    listaCarrito.appendChild(li);
  });
  modal.classList.remove('hidden');
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarTotal();
  mostrarCarrito();
}

cancelarBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

enviarBtn.addEventListener('click', () => {
  const nombre = document.getElementById('nombre').value.trim();
  const entrega = document.getElementById('entrega').value.trim();
  const metodoPago = document.querySelector('input[name="pago"]:checked')?.value;

  if (!nombre || !entrega || !metodoPago) {
    alert('Por favor completa todos los campos.');
    return;
  }

  const mensaje = `*Nuevo Pedido*%0A
*Nombre:* ${nombre}%0A
*Entrega:* ${entrega}%0A
*Pago:* ${metodoPago}%0A
*Detalle:*%0A${carrito.map(item => `- ${item.nombre}: $${item.precio.toLocaleString('es-AR')}`).join('%0A')}%0A
*Total:* $${carrito.reduce((s, i) => s + i.precio, 0).toLocaleString('es-AR')}`;

  const numero = '5491123456789'; // Cambiar por el número real
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');

  carrito = [];
  localStorage.removeItem('carrito');
  actualizarTotal();
  modal.classList.add('hidden');
});
