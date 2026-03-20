const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const content = fs.readFileSync(envPath, 'utf8');

const lines = content.split('\n');
let newLines = [];
let inPrivateKey = false;
let privateKeyLines = [];

for (let line of lines) {
    if (line.startsWith('private_key="')) {
        inPrivateKey = true;
        privateKeyLines.push(line);
        if (line.trim().endsWith('"') && line.trim() !== 'private_key="') {
            inPrivateKey = false;
        }
    } else if (inPrivateKey) {
        privateKeyLines.push(line);
        if (line.trim().endsWith('"')) {
            inPrivateKey = false;
        }
    } else {
        newLines.push(line);
    }
}

if (privateKeyLines.length > 0) {
    // Join all lines and normalize newlines
    let fullKeyAttr = privateKeyLines.join('\n');
    // Extract the content between the first and last "
    const firstQuote = fullKeyAttr.indexOf('"');
    const lastQuote = fullKeyAttr.lastIndexOf('"');
    let keyContent = fullKeyAttr.substring(firstQuote + 1, lastQuote);
    
    // Remove actual newlines and consolidate
    keyContent = keyContent.replace(/\r?\n/g, '');
    
    const cleanLine = `private_key="${keyContent}"`;
    // Insert back where we found it (assuming after private_key_id)
    const idIdx = newLines.findIndex(l => l.startsWith('private_key_id='));
    if (idIdx > -1) {
        newLines.splice(idIdx + 1, 0, cleanLine);
    } else {
        newLines.push(cleanLine);
    }
}

fs.writeFileSync(envPath, newLines.join('\n'));
console.log("Cleaned .env file");
