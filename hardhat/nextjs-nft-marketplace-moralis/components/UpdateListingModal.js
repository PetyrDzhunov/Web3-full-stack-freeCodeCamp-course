import { Modal, Input } from 'web3uikit';
import { useState } from 'react';
export default function UpdateListingModal({ nftAddress, tokenId, isVisible }) {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
  console.log(priceToUpdateListingWith);

  return (
    <Modal isVisible={isVisible}>
      <Input
        label='Update listing price in L1 Currency (ETH)'
        name='New listing price'
        type='number'
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      ></Input>
    </Modal>
  );
}
