import { useQuery, gql } from '@apollo/client';
import GET_ACTIVE_ITEMS from '../constants/subgraphQueries';

export default function GraphExample() {
  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);
  console.log(data);
  return <div>Hi</div>;
}
