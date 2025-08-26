export async function fetchTransactions(page: number, query?: string) {
  const baseUrl = "http://localhost:4000"; // backend server
  const url = query
    ? `${baseUrl}/api/transactions?query=${encodeURIComponent(query)}&p=${page}`
    : `${baseUrl}/api/transactions?p=${page}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load transactions: ${text}`);
  }
  return res.json();
}
