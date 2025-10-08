const { generateSeedPhrase, walletFromSeed } = require('@lucid-evolution/lucid');

console.log('Direct test of generateSeedPhrase:\n');

const mnemonic = generateSeedPhrase();
console.log('Type:', typeof mnemonic);
console.log('Length:', mnemonic.length);
console.log('Value:', mnemonic);
console.log('Split by space:', mnemonic.split(' ').length, 'words');
console.log('First 50 chars:', mnemonic.substring(0, 50));
