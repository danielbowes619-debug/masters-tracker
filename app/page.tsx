"use client";

import { useEffect, useState } from "react";

type TrackerRow = {
  person: string;
  golfer1: string;
  golfer2: string;
  score1Display: string;
  score2Display: string;
  totalDisplay: string;
};

type TrackerResponse = {
  ok: boolean;
  source?: string;
  fetchedAt?: string;
  playerCount?: number;
  unmatched?: string[];
  results?: TrackerRow[];
  error?: string;
};

function scoreClass(v?: string) {
  if (!v) return "";
  if (v.startsWith("-")) return "under";
  if (v.startsWith("+")) return "over";
  if (v === "E") return "even";
  return "";
}

export default function HomePage() {
  const [data, setData] = useState<TrackerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/tracker", { cache: "no-store" });
      const json = (await res.json()) as TrackerResponse;
      setData(json);
    } catch {
      setData({ ok: false, error: "Could not load live scores." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, []);

  const rows = data?.results ?? [];
  const topThree = rows.slice(0, 3);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">Fantasy Golf Pool</div>
        <h1>Masters Tracker</h1>
        <p className="hero-text">
          Live leaderboard for your group. Lowest combined score wins.
        </p>

        <div className="hero-actions">
          <button className="primary-btn" onClick={() => void load()}>
            Refresh Live Scores
          </button>
        </div>

        <div className="chips">
          <span className="chip">Source: {data?.source ?? "Loading..."}</span>
          <span className="chip">
            Updated: {data?.fetchedAt ?? (loading ? "Loading..." : "—")}
          </span>
          <span className="chip">
            Players found: {data?.playerCount ?? (loading ? "..." : "—")}
          </span>
        </div>
      </section>

      {!data?.ok && !loading ? (
        <section className="panel">
          <h2>Tracker Error</h2>
          <p>{data?.error ?? "Something went wrong."}</p>
        </section>
      ) : null}

      <section className="content-grid">
        <section className="panel">
          <h2>Top 3</h2>
          <div className="leaders">
            {topThree.map((row, idx) => (
              <article className="leader-card" key={row.person + idx}>
                <div className="leader-top">
                  <div className="rank-box">#{idx + 1}</div>
                  <div>
                    <div className="person-name">{row.person}</div>
                    <div className="muted">
                      {row.golfer1} + {row.golfer2}
                    </div>
                  </div>
                  <div className={`big-total ${scoreClass(row.totalDisplay)}`}>
                    {row.totalDisplay || "-"}
                  </div>
                </div>
                <div className="golfer-grid">
                  <div className="golfer-card">
                    <div className="golfer-name">{row.golfer1}</div>
                    <div className={`golfer-score ${scoreClass(row.score1Display)}`}>
                      {row.score1Display || "-"}
                    </div>
                  </div>
                  <div className="golfer-card">
                    <div className="golfer-name">{row.golfer2}</div>
                    <div className={`golfer-score ${scoreClass(row.score2Display)}`}>
                      {row.score2Display || "-"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Standings</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Golfer 1</th>
                  <th>Golfer 2</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.person + idx}>
                    <td>#{idx + 1}</td>
                    <td>
                      <strong>{row.person}</strong>
                    </td>
                    <td>
                      {row.golfer1}
                      <br />
                      <span className={`score-pill ${scoreClass(row.score1Display)}`}>
                        {row.score1Display || "-"}
                      </span>
                    </td>
                    <td>
                      {row.golfer2}
                      <br />
                      <span className={`score-pill ${scoreClass(row.score2Display)}`}>
                        {row.score2Display || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`score-pill ${scoreClass(row.totalDisplay)}`}>
                        {row.totalDisplay || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="note-block">
            <div className="note-title">Unmatched names</div>
            <div className="muted small-text">
              {data?.unmatched?.length
                ? data.unmatched.join(", ")
                : "None"}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
