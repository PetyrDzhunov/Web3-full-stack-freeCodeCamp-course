import { useEffect, useState } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import nftAbi from '../constants/BasicNft.json';
import Image from 'next/image';
import { Card } from 'web3uikit';
import { ethers } from 'ethers';

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const { isWeb3Enabled } = useMoralis();
  const [imageURI, setImageURI] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  console.log(tokenId);
  const { runContractFunction: getTokenURI, error } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: 'tokenURI',
    params: {
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    //get tokenURI
    const tokenURI = await getTokenURI();
    console.log(`The tokenURI is: ${tokenURI}`);
    // since IPFS is not globally adopted and not everybody has it we replace it with a https thanks to the IPFS gateway so everybody can see and get the images loaded

    if (tokenURI) {
      // IPFS Gateway : A server that will return IPFS files from a "normal" URL.
      const requestURL = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      setImageURI(imageURIURL);
      console.log(tokenURIResponse);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
    //using the image tag from the tokenURI, get the image
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      <div>
        {imageURI ? (
          <Card title={tokenName} description={tokenDescription}>
            <div>#{tokenId}</div>
            <div className='italic text-sm'>Owned by {seller}</div>
            <Image
              loader={() => imageURI}
              src={imageURI}
              height='200'
              width='200'
            />
            <div className='font-bold'>
              {ethers.utils.formatUnits(price, 'ether')} ETH
            </div>
          </Card>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
