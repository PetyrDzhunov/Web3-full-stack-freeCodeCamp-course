import { ethers } from './ethers-5.6.esm.min.js';
import {abi} from './constants '
const ethereum = window.ethereum;
const connectBtn = document.getElementById('connectButton');
const fundBtn = document.getElementById('fundButton');

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

const fund = async (ethAmount) => {
  try {
    await checkIfWalletExist(fundBtn);
    console.log(`Funding with ${ethAmount}...`);
    //provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract =
    // signer / wallet / someone with gas
    // contract that we are interacting with
  } catch (err) {
    console.log(err);
  }
};

connectBtn.addEventListener('click', connect);
fundBtn.addEventListener('click', fund);
