import { useMoralis } from 'react-moralis';

export default function ManualHeader() {
  const { enableWeb3, account } = useMoralis();

  const connect = async () => {
    await enableWeb3();
    console.log(account);
  };

  return (
    <div>
      {account ? (
        <div>Conncted!</div>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
