const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
const modal = document.getElementById('modal-carrito');
const modalContent = document.getElementById('lista-carrito');
const nombreInput = document.getElementById('nombre');
const entregaInput = document.getElementById('entrega');
const metodoPagoInputs = document.getElementsByName('pago');
const enviarPedidoBtn = document.getElementById('enviar-whatsapp');
const cerrarModalBtn = document.getElementById('cancelar');

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let combosData = [];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    combosData = data;
    data.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'relative rounded-lg overflow-hidden shadow-lg h-64 flex items-end justify-center';

      const imagenUrl = combo.Imagen || combo.imagen || '';
      const nombre = (combo.Nombre || combo.nombre || 'Sin nombre').toUpperCase();
      const productos = combo.Productos || combo.productos || '';
      const productosHTML = productos.split(',').map(prod => `<li>${prod.trim()}</li>`).join('');
      const precio = parseFloat(combo.Precio || combo.precio || 0);

      card.style.backgroundImage = `url('${imagenUrl}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';

      card.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-4 text-white">
          <div>
            <h2 class="text-lg font-bold uppercase">${nombre}</h2>
          </div>
          <div class="overflow-auto max-h-32">
            <ul class="text-sm list-disc list-inside">${productosHTML}</ul>
          </div>
          <div>
            <p class="text-lg font-semibold mt-2">$${precio.toLocaleString('es-AR')}</p>
            <button class="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white add-to-cart">Agregar al carrito</button>
          </div>
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

function agruparCarrito(carrito) {
  const agrupado = [];

  carrito.forEach(item => {
    const existente = agrupado.find(el =>
      el.nombre === item.nombre &&
      el.productos === item.productos
    );

    if (existente) {
      existente.cantidad += 1;
    } else {
      agrupado.push({ ...item, cantidad: 1 });
    }
  });

  return agrupado;
}

function renderizarCarrito() {
  modalContent.innerHTML = '';
  const carritoAgrupado = agruparCarrito(carrito);

  carritoAgrupado.forEach(item => {
    const div = document.createElement('div');
    div.className = 'mb-4 border-b pb-2';

    const productosHTML = item.productos.split(',').map(prod => `<li>${prod.trim()}</li>`).join('');

    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold">${item.nombre}</p>
          <p class="text-sm text-gray-700">Cantidad: ${item.cantidad}</p>
          <ul class="text-sm list-disc list-inside">${productosHTML}</ul>
          <p class="text-red-600 font-medium">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
          <div class="mt-2 space-x-2">
            <button class="bg-gray-200 px-2 rounded" onclick="cambiarCantidad('${item.nombre}', '${item.productos}', -1)">−</button>
            <button class="bg-gray-200 px-2 rounded" onclick="cambiarCantidad('${item.nombre}', '${item.productos}', 1)">+</button>
          </div>
        </div>
      </div>
    `;

    modalContent.appendChild(div);
  });
}

function cambiarCantidad(nombre, productos, cambio) {
  const index = carrito.findIndex(item =>
    item.nombre === nombre && item.productos === productos
  );

  if (index !== -1) {
    if (cambio === -1) {
      carrito.splice(index, 1);
    } else if (cambio === 1) {
      carrito.push({ nombre, productos, precio: carrito[index].precio });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarTotal();
    renderizarCarrito();
  }
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

  const agrupado = agruparCarrito(carrito);

  agrupado.forEach(item => {
    mensaje += `*${item.nombre}* x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n`;
    const productos = item.productos.split(',').map(p => p.trim());
    productos.forEach(prod => mensaje += `  - ${prod}\n`);
    mensaje += `\n`;
  });

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  mensaje += `*Total:* $${total.toLocaleString('es-AR')}`;

  const numeroWhatsApp = '5491123456789'; // ← Reemplazalo por el número deseado
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  carrito = [];
  localStorage.removeItem('carrito');
  actualizarTotal();
  modal.classList.add('hidden');
  nombreInput.value = '';
  entregaInput.value = '';
  metodoPagoInputs.forEach(r => r.checked = false);
});
