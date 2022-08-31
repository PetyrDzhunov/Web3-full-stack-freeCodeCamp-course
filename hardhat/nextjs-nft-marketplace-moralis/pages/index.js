import styles from '../styles/Home.module.css';
import { useMoralisQuery, useMoralis } from 'react-moralis';
import NFTBox from '../components/NFTBox';

export default function Home() {
  //We will index the events off-chain and then read from our database.
  // Setup a server to listen for those events to be fire, and we will add them to a database to query.
  // That is centralized with Moralis and decentralized with The Graph.
  const { isWeb3Enabled } = useMoralis();
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    'ActiveItem',
    (query) => query.limit(10).descending('tokenId'),
  );

  return (
    <div className='container mx-auto'>
      <h1 className='py-4 px-4 font-bold text-2xl'>Recently Listed</h1>
      <div className='flex flex-wrap'>
        {isWeb3Enabled ? (
          fetchingListedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.map((nft) => {
              const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                nft.attributes;
              return (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                />
              );
            })
          )
        ) : (
          <div>Web3 is currently not enabled</div>
        )}
      </div>
    </div>
  );
}
