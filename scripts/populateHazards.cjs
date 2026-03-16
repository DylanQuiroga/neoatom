const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/elementsData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Reglas realistas de peligros químicos para los elementos puros
const inflamables = [1, 3, 11, 12, 13, 15, 16, 19, 20, 21, 22, 37, 38, 39, 40, 55, 56, 58, 59, 60, 62, 63, 72, 87, 88]; 
const corrosivos = [8, 9, 17, 35, 53];
const toxicos = [4, 5, 9, 17, 23, 24, 25, 27, 28, 29, 33, 34, 35, 47, 48, 50, 51, 52, 53, 56, 76, 78, 80, 81, 82, 83];
const radioactivos = [43, 61];

for (let i = 84; i <= 118; i++) {
  radioactivos.push(i);
}

// Los elementos altamente radioactivos suelen ser tóxicos por radiotoxicidad o metales pesados
const allToxicos = new Set([...toxicos, ...radioactivos]);

Object.values(data).forEach(element => {
  let h = new Set();
  const z = element.atomicNumber;
  
  if (inflamables.includes(z)) h.add('Inflamable');
  if (corrosivos.includes(z)) h.add('Corrosivo');
  if (allToxicos.has(z)) h.add('Tóxico');
  if (radioactivos.includes(z)) h.add('Radioactivo');
  
  // Guardamos ordenados
  element.hazards = Array.from(h);
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Update complete');
