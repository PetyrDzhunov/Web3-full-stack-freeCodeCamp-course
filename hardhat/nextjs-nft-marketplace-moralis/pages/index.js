import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
  //We will index the events off-chain and then read from our database.
  // Setup a server to listen for those events to be fire, and we will add them to a database to query.
  // That is centralized with Moralis and decentralized with The Graph.

  return <div className={styles.container}></div>;
}
