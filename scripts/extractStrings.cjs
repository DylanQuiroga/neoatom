const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/periodic-table-lookup.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const categories = new Set();
const appearances = new Set();
const phases = new Set();

Object.keys(data).forEach(key => {
  if (key === 'order') return;
  const el = data[key];
  if (el.category) categories.add(el.category);
  if (el.appearance) appearances.add(el.appearance);
  if (el.phase) phases.add(el.phase);
});

console.log('Categories:', Array.from(categories));
console.log('Appearances:', Array.from(appearances));
console.log('Phases:', Array.from(phases));
