import { gql } from '@apollo/client';

const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(first: 5, where: { buyer: null }) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default GET_ACTIVE_ITEMS;
