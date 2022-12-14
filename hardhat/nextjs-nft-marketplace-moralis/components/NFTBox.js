import { useEffect, useState } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import nftAbi from '../constants/BasicNft.json';
import Image from 'next/image';
import { Card, useNotification } from 'web3uikit';
import { ethers } from 'ethers';
import UpdateListingModal from './UpdateListingModal';

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = '...';
  let separatorLength = separator.length;
  const charsToShow = strLen - separatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const dispatch = useNotification();

  const hideModal = () => setShowModal(false);

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'buyItem',
    msgValue: price,
    params: {
      nftAddress,
      tokenId,
    },
  });

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (err) => console.log(err),
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: 'success',
      message: 'Item bought!',
      title: 'Item Bought',
      position: 'topR',
    });
  };

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

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser
    ? 'you'
    : truncateStr(seller || '', 15);

  return (
    <div>
      <div>
        {imageURI ? (
          <div className='m-4'>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            />
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className='p-2'>
                <div className='flex flex-col items-end gap-2'>
                  <div>#{tokenId}</div>
                  <div className='italic text-sm'>
                    Owned by {formattedSellerAddress}
                  </div>
                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    height='200'
                    width='200'
                  />
                  <div className='font-bold'>
                    {ethers.utils.formatUnits(price, 'ether')} ETH
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
