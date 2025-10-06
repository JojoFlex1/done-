const { generateSeedPhrase, walletFromSeed } = require('@lucid-evolution/lucid');

console.log('Testing Lucid Evolution wallet generation...\n');

try {
  // Generate mnemonic
  const mnemonic = generateSeedPhrase();
  console.log('Generated Mnemonic:');
  console.log(mnemonic);
  console.log('\nWord Count:', mnemonic.split(' ').length);
  console.log('First 3 words:', mnemonic.split(' ').slice(0, 3).join(' '));

  // Generate wallet
  const wallet = walletFromSeed(mnemonic, { network: 'Preprod' });
  
  console.log('\n--- Wallet Details ---');
  console.log('Address:', wallet.address);
  console.log('Reward Address:', wallet.rewardAddress);
  console.log('\nAddress starts with:', wallet.address.substring(0, 10));
  console.log('Is valid Preprod?', wallet.address.startsWith('addr_test1'));
  
} catch (error) {
  console.error('ERROR:', error.message);
  console.error('Full error:', error);
}
