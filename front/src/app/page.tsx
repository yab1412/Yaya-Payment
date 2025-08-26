"use client";
import React, { useEffect, useMemo, useState } from "react";
import { fetchTransactions } from "./api";
import styles from "./page.module.scss";

type Tx = {
  id?: string;
  transaction_id?: string;
  sender?: string | { name?: string; account?: string };
  receiver?: string | { name?: string; account?: string };
  sender_account_name?: string;
  receiver_account_name?: string;
  amount?: number | string;
  currency?: string;
  cause?: string;
  created_at?: string;
  createdAt?: string;
};

function normalize(t: Tx) {
  const formatAccount = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object")
      return val.name ?? val.account ?? JSON.stringify(val);
    return String(val);
  };

  return {
    id: t.id ?? t.transaction_id ?? "",
    sender: formatAccount(t.sender ?? t.sender_account_name),
    receiver: formatAccount(t.receiver ?? t.receiver_account_name),
    amount: Number(t.amount ?? 0),
    currency: t.currency ?? "",
    cause: t.cause ?? "",
    created_at: t.created_at ?? t.createdAt ?? "",
  };
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchBox, setSearchBox] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState("Yaya Wallet Pii"); // your account name/ID
  const [error, setError] = useState<string | null>(null);

  async function load(p: number, q?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(p);
      const items: Tx[] = (data?.results ??
        data?.data ??
        data?.items ??
        []) as Tx[];

      let filtered = items;

      // if (q) {
      //   const queryLower = q.toLowerCase();
      //   filtered = items.filter(tx => {
      //     const senderName =
      //       typeof tx.sender === "object" ? tx.sender ?? "" : tx.sender ?? "";
      //     const receiverName =
      //       typeof tx.receiver === "object" ? tx.receiver ?? "" : tx.receiver ?? "";
      //     const cause = tx.cause ?? "";
      //     const id = tx.transaction_id ?? tx.id ?? "";

      //     return (
      //       senderName.toLowerCase().includes(queryLower) ||
      //       receiverName.toLowerCase().includes(queryLower) ||
      //       cause.toLowerCase().includes(queryLower) ||
      //       id.toLowerCase().includes(queryLower)
      //     );
      //   });
      // }

      if (q) {
        const queryLower = q.toLowerCase();
        filtered = items.filter((tx) => {
          const senderName =
            typeof tx.sender === "object"
              ? tx.sender?.name ?? tx.sender?.account ?? ""
              : tx.sender ?? "";

          const receiverName =
            typeof tx.receiver === "object"
              ? tx.receiver?.name ?? tx.receiver?.account ?? ""
              : tx.receiver ?? "";

          const cause = tx.cause ?? "";
          const id = tx.transaction_id ?? tx.id ?? "";

          return (
            senderName.toLowerCase().includes(queryLower) ||
            receiverName.toLowerCase().includes(queryLower) ||
            cause.toLowerCase().includes(queryLower) ||
            id.toLowerCase().includes(queryLower)
          );
        });
      }

      setTransactions(filtered);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page, query);
  }, [page, query]);

  const rows = useMemo(() => transactions.map(normalize), [transactions]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchBox);
  };

  return (
    <div className={styles.container}>
      <h2>Transactions</h2>

      <form className={styles.controls} onSubmit={onSubmitSearch}>
        <input
          type="text"
          placeholder="My account (name or ID)"
          value={me}
          onChange={(e) => setMe(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search sender, receiver, cause, or ID…"
          value={searchBox}
          onChange={(e) => setSearchBox(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmitSearch(e as any);
          }}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div className={styles.status}>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Cause</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => {
            const isTopUp =
              tx.sender && tx.receiver && tx.sender === tx.receiver;
            const isIncoming =
              isTopUp ||
              (!!me && tx.receiver?.toLowerCase() === me.toLowerCase());
            return (
              <tr
                key={tx.id}
                className={isIncoming ? styles.incoming : styles.outgoing}
              >
                <td>{tx.id}</td>
                <td>{tx.sender}</td>
                <td>{tx.receiver}</td>
                <td>{tx.amount}</td>
                <td>{tx.currency}</td>
                <td>{tx.cause}</td>
                <td>
                  {tx.created_at
                    ? new Date(tx.created_at).toLocaleString()
                    : ""}
                </td>
              </tr>
            );
          })}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={7} className={styles.empty}>
                No transactions
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={loading} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
