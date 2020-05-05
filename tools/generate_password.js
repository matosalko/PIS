const readline = require("readline");
const crypto = require('crypto')

function hashData(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Tento nastroj zahashuje heslo do SHA-256');
rl.question("Zadajte heslo: ", function(password) {
    console.log(hashData(password));
    rl.close();
});