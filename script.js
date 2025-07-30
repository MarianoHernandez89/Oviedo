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
      card.className = 'rounded-lg overflow-hidden shadow-lg bg-white flex flex-col';

      const imagenUrl = combo.Imagen || combo.imagen || '';
      const nombre = (combo.Nombre || combo.nombre || 'Sin nombre').toUpperCase();
      const productos = combo.Productos || combo.productos || '';
      const productosHTML = productos.split(',').map(prod => `<li>${prod.trim()}</li>`).join('');
      const precio = parseFloat(combo.Precio || combo.precio || 0);

      card.style.backgroundImage = `url('${imagenUrl}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';

      card.innerHTML = `
        <!-- Imagen con título y productos -->
        <div class="relative h-60 bg-cover bg-center" style="background-image: url('${imagenUrl}')">
          <!-- Nombre del combo arriba -->
          <div class="absolute top-0 left-0 right-0 bg-black/70 text-white text-center py-1 z-10">
            <h2 class="text-base md:text-lg font-bold uppercase truncate px-2">${nombre}</h2>
          </div>
      
          <!-- Productos centrados -->
          <div class="absolute inset-0 flex items-center justify-center px-4 text-center">
            <div class="text-xs md:text-sm text-white font-semibold uppercase space-y-1 mt-8">
              ${productos.split(',').map(prod => `<p>${prod.trim()}</p>`).join('')}
            </div>
          </div>
        </div>
      
        <!-- Parte inferior: precio y botón -->
        <div class="p-4 flex flex-col items-center space-y-2">
          <p class="text-lg font-bold text-red-700">$${precio.toLocaleString('es-AR')}</p>
          <button class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded add-to-cart">
            Agregar al carrito
          </button>
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
