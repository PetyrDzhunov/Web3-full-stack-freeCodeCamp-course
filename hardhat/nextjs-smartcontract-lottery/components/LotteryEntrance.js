import { contractAddresses, abi } from '../constants';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNotification } from 'web3uikit';

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis(); // hex number of the chainId
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState('0');

  const dispatch = useNotification();

  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'enterRaffle',
    params: {},
    msgValue: entranceFee, //
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      async function updateUI() {
        const asd = await getEntranceFee();
        console.log(asd);
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        setEntranceFee(entranceFeeFromCall);
      }
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleNewNotification = () => {
    dispatch({
      type: 'info',
      message: 'Transaction Complete!',
      title: 'Tx Notification',
      position: 'topR',
      icon: 'bell',
    });
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
  };

  const enterRaffleHandler = async () => {
    await enterRaffle({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    });
  };

  return (
    <div>
      Hi from Lottery Entrance
      {raffleAddress ? (
        <p>
          <button onClick={enterRaffleHandler}>Enter Raffle</button>
          Entrance Fee: {ethers.utils.formatEther(entranceFee, 'ether')} ETH
        </p>
      ) : (
        <div>No Raffle Address Detected</div>
      )}
    </div>
  );
}
