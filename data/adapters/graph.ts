export async function query(
  subgraph: string,
  query: string,
  variables?: any,
  operationName?: string
): Promise<any> {
  const request = await fetch(`https://api.thegraph.com/subgraphs/name/${subgraph}`, {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables, operationName }),
    method: 'POST',
  });

  const { data } = await request.json();
  return data;
}
