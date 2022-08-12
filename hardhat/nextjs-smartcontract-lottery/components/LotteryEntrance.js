// have a function to enter the lottery

import { useWeb3Contract } from 'react-moralis';
import { contractAddresses, abi } from '../constants';
import { useMoralis } from 'react-moralis';
import { useEffect } from 'react';

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis(); // hex number of the chainId
  const chainId = parseInt(chainIdHex);
  console.log(chainId);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  // const { runContractFunction: enterRaffle } = useWeb3Contract({
  //   abi: abi,
  //   contractAddress: raffleAddress,
  //   functionName: 'enterRaffle',
  //   params: {},
  //   msgValue: '', //
  // });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      async function updateUI() {
        const entranceFeeFromContract = await getEntranceFee();
        console.log(entranceFeeFromContract);
      }
      updateUI();
    }
  }, [isWeb3Enabled]);

  return <div>Hi from Lottery Entrance</div>;
}
