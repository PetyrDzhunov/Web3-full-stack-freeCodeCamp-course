import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js ';
const ethereum = window.ethereum;
const connectBtn = document.getElementById('connectButton');
const fundBtn = document.getElementById('fundButton');
const balanceBtn = document.getElementById('balanceButton');
const withdrawBtn = document.getElementById('withdrawButton');

const checkIfWalletExist = async (button) => {
  if (typeof ethereum !== 'undefined') {
    await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (button.textContent === 'Connect') {
      button.innerHTML = 'Connected!';
    }

    if (button.textContent === 'Fund') {
      button.innerHTML = 'Funded successfully!';
    }
  } else {
    button.innerHTML = 'Please install Metamask!';
  }
};

const connect = async () => {
  try {
    await checkIfWalletExist(connectBtn);
  } catch (err) {
    console.log(err);
  }
};

const fund = async () => {
  const ethAmount = document.getElementById('ethAmount').value;
  try {
    await checkIfWalletExist(fundBtn);
    console.log(`Funding with ${ethAmount}...`);
    //provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    // signer / wallet / someone with gas
    // contract that we are interacting with
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    // wait for the TX to finish
    await listenForTransactionMine(transactionResponse, provider);
    console.log('Done');
  } catch (err) {
    console.log(err);
  }
};

const getBalance = async () => {
  await checkIfWalletExist(balanceBtn);
  const provider = new ethers.providers.Web3Provider(ethereum);
  const balance = await provider.getBalance(contractAddress);
  console.log(ethers.utils.formatEther(balance));
};

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  //create a listener for the blockchain
  // listen for this transaction to finish
  // event ->
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`,
      );
      resolve();
    });
  });
}

const withdraw = async () => {
  await checkIfWalletExist(withdrawBtn);
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  console.log('Withdrawing...');
  const contract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const transactionResponse = await contract.withdraw();
    await listenForTransactionMine(transactionResponse, provider);
  } catch (e) {
    console.log(e);
  }
};

connectBtn.addEventListener('click', connect);
fundBtn.addEventListener('click', fund);
balanceBtn.addEventListener('click', getBalance);
withdrawBtn.addEventListener('click', withdraw);
