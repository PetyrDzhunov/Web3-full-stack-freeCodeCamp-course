const Moralis = require('moralis/node');
require('dotenv').config();
const contractAddress = require('./constants/networkMapping.json');
// Moralis understand a local chain is 1337
let chainId = process.env.chainId || 31337;
let moralisChainId = chainId == '31337' ? '1337' : chainId;
const contractAddress = contractAddress[chainId]['NftMarketplace'][0]; // getting the most recently deployed nft marketplace contract
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const APP_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const MASTER_KEY = process.env.MASTER_KEY;

// We are indexing these events to be easier to query them.
// We're saying moralis - hey listen to these events, whenever
// you hear any of these 3 events stick all the stuff in the database so we can read from it.

async function main() {
  await Moralis.start({ SERVER_URL, APP_ID, MASTER_KEY });
  console.log('Working with contract address ' + contractAddress);

  let itemListedOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemListed(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemListed',
      type: 'event',
    },
    tableName: 'ItemListed',
  };

  let itemBoughtOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemBought(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'buyer',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemBought',
      type: 'event',
    },
    tableName: 'ItemBought',
  };

  let itemCanceledOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemCanceled(address,address,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ItemCanceled',
      type: 'event',
    },
    tableName: 'ItemCanceled',
  };

  const listedResponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemListedOptions,
    { useMasterKey: true },
  );
  const boughtResponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemBoughtOptions,
    { useMasterKey: true },
  );
  const canceledResponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemCanceledOptions,
    { useMasterKey: true },
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
