import json

with open('src/data/elementsData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

radioactive = [43, 61]
for i in range(84, 119):
    radioactive.append(i)

flammable = [1, 3, 11, 12, 13, 15, 16, 19, 37, 55, 87]
corrosive = [8, 9, 17, 35, 53]
toxic = [4, 9, 17, 24, 33, 35, 48, 53, 76, 80, 81, 82, 86]

for key, el in data.items():
    at_num = el.get('atomicNumber', int(key))
    hazards = []
    if at_num in radioactive: hazards.append('Radioactivo')
    if at_num in flammable: hazards.append('Inflamable')
    if at_num in corrosive: hazards.append('Corrosivo')
    if at_num in toxic or at_num in radioactive or at_num >= 82:
        if 'Tóxico' not in hazards: hazards.append('Tóxico')
    el['hazards'] = hazards

with open('src/data/elementsData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("Patched")
