const fs = require('fs');
const path = './src/data/elementsData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const radioactive = [43, 61]; // Tc, Pm
for(let i=84; i<=118; i++) radioactive.push(i);

// Some basic flammable elements
const flammable = [1, 3, 11, 12, 13, 15, 16, 19, 37, 55, 87]; 

// Corrosive and oxidizers
const corrosive = [8, 9, 17, 35, 53]; 

// Toxic
const toxic = [4, 9, 17, 24, 33, 35, 48, 53, 76, 80, 81, 82, 86]; 

Object.values(data).forEach(el => {
  const hazards = [];
  if (radioactive.includes(el.atomicNumber)) hazards.push('Radioactivo');
  if (flammable.includes(el.atomicNumber)) hazards.push('Inflamable');
  if (corrosive.includes(el.atomicNumber)) hazards.push('Corrosivo');
  
  // Consider heavy radioactive metals as toxic too
  if (toxic.includes(el.atomicNumber) || radioactive.includes(el.atomicNumber) || el.atomicNumber >= 82) {
     if(!hazards.includes('Tóxico')) hazards.push('Tóxico');
  }
  
  el.hazards = hazards;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Patched hazards successfully.');
