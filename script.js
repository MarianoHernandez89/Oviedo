const SHEET_ID = 'PEGÁ_ACÁ_TU_ID';
const SHEET_NAME = 'Hoja1'; // o el nombre de tu pestaña
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

const combosContainer = document.getElementById('combos-container');
const totalSpan = document.getElementById('total');
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    data.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'rounded overflow-hidden shadow-lg bg-white relative';

      card.innerHTML = `
        <div class="h-40 bg-cover bg-center" style="background-image: url('${combo.Imagen}')"></div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">${combo.Nombre}</h2>
          <p class="text-sm mb-2">${combo.Productos}</p>
          <p class="text-lg font-semibold text-red-700">$${combo.Precio}</p>
          <button class="mt-2 bg-red-700 text-white px-3 py-1 rounded add-to-cart">Agregar al carrito</button>
        </div>
      `;

      card.querySelector('.add-to-cart').addEventListener('click', () => {
        carrito.push({
          id: combo.ID,
          nombre: combo.Nombre,
          precio: parseFloat(combo.Precio)
        });
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
  const resumen = carrito.map(item => `- ${item.nombre}: $${item.precio}`).join('\n');
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  alert(`Carrito:\n\n${resumen}\n\nTotal: $${total.toLocaleString('es-AR')}`);
});
