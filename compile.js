const fs = require('fs');
const path = require('path');

const bundle = fs.readFileSync(path.join(__dirname,'bundle.js'), 'utf8');

const sc = fs.readFileSync(path.join(__dirname,'sc.js'), 'utf8');

const fr = bundle+"\n"+sc;

fs.writeFileSync(path.join(__dirname,'foreground.js'), fr,'utf8');
