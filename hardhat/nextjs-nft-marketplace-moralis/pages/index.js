import styles from '../styles/Home.module.css';
import { useMoralisQuery } from 'react-moralis';

export default function Home() {
  //We will index the events off-chain and then read from our database.
  // Setup a server to listen for those events to be fire, and we will add them to a database to query.
  // That is centralized with Moralis and decentralized with The Graph.
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    'ActiveItem',
    (query) => query.limit(10).descending('tokenId'),
  );

  console.log(listedNfts);

  return (
    <div className={styles.container}>
      {fetchingListedNfts ? (
        <div>Loading...</div>
      ) : (
        listedNfts.map((nft) => {
          const { price, nftAddress, tokenId, marketPlaceAddress, seller } =
            nft.attributes;
          return (
            <div>
              Price: {price}. NftAddress: {nftAddress}. TokenId: {tokenId}{' '}
              Seller: {seller}
            </div>
          );
        })
      )}
    </div>
  );
}
