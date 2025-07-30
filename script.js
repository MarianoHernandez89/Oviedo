const SHEET_ID = '1YUK837KaCVRFGvSoBG5y0AANIAaFtD6ea00ikSrqR-o';
const SHEET_NAME = 'Combos';
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    console.log('Datos cargados:', data); // 👈 Log para depuración

    data.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'rounded overflow-hidden shadow-lg bg-white relative';

      const imagenUrl = combo.Imagen || combo.imagen || ''; // por si está en minúscula
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
        carrito.push({
          nombre,
          precio
        });
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

document.getElementById('ver-carrito').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const resumen = carrito.map(item => `- ${item.nombre}: $${item.precio.toLocaleString('es-AR')}`).join('\n');
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  alert(`Carrito:\n\n${resumen}\n\nTotal: $${total.toLocaleString('es-AR')}`);
});
