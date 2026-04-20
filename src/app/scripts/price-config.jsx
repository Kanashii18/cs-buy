const slider = document.getElementById('priceRange');
     const output = document.getElementById('priceValue');

     // Mostrar valor inicial al cargar
     output.textContent = `${slider.value} €`;

     // Actualizar el número al mover el slider
     slider.addEventListener('input', () => {
     output.textContent = `${slider.value} €`;
});