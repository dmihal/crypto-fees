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

  const response = await request.json();

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  return response.data;
}
