import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Form, useNotification } from 'web3uikit';
import { ethers } from 'ethers';
import nftAbi from '../constants/BasicNft.json';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../constants/networkMapping.json';

export default function SellPage() {
  const dispatch = useNotification();
  const { chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : '31337';
  console.log(chainString);
  console.log(typeof chainString);
  const marketplaceAddress = networkMapping[chainString]['NftMarketplace'][0];

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    console.log('Approving...');
    console.log(data);
    const nftAdrress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, 'ether')
      .toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAdrress,
      functionName: 'approve',
      params: {
        to: marketplaceAddress,
        tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAdrress, tokenId, price),
      onError: (error) => console.log(error),
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    console.log('Ok! Now time to list!');
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: 'listItem',
      params: {
        nftAddress,
        tokenId,
        price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess() {
    dispatch({
      type: 'success',
      message: 'NFT Listing',
      title: 'NFT Listed',
      position: 'topR',
    });
  }

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: 'NFT Address',
            type: 'text',
            inputWidth: '50%',
            value: '',
            key: 'nftAddress',
          },
          { name: 'Token ID', type: 'number', value: '', key: 'tokenId' },
          { name: 'Price (in ETH)', type: 'number', value: '', key: 'price' },
        ]}
        title='Sell your NFT'
        id='Main Form'
      />
    </div>
  );
}
