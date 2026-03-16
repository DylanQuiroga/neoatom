const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../src/data/periodic-table-lookup.json');
const mainData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

const files = [
  'translations_1_30.json',
  'translations_31_60.json',
  'translations_61_90.json',
  'translations_91_118.json'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.keys(translations).forEach(key => {
      if (mainData[key]) {
        mainData[key].name = translations[key].name;
        mainData[key].summary = translations[key].summary;
        mainData[key].appearance = translations[key].appearance;
        mainData[key].category = translations[key].category;
        mainData[key].phase = translations[key].phase;
      } else {
          console.warn(`Key ${key} not found in main data`);
      }
    });
  }
});

fs.writeFileSync(mainPath, JSON.stringify(mainData, null, 4), 'utf8');
console.log('Merge complete. Periodic table lookup is now in Spanish.');
