const ESPN_URL =
 https://www.espn.com/golf/leaderboard?season=2025&tournamentId=401811941;

const PICKS = [
  { person: "James", golfer1: "Collin Morikawa", golfer2: "Cameron Smith" },
  { person: "Tandy", golfer1: "Xander Schauffele", golfer2: "Daniel Berger" },
  { person: "Josh", golfer1: "Justin Rose", golfer2: "Kurt Kitayama" },
  { person: "Niles", golfer1: "Ludvig Aberg", golfer2: "Keegan Bradley" },
  { person: "Snow", golfer1: "Jordan Spieth", golfer2: "Jacob Bridgeman" },
  { person: "Spike", golfer1: "Tommy Fleetwood", golfer2: "Max Homa" },
  { person: "Kirgan", golfer1: "Cameron Young", golfer2: "Gary Woodland" },
  { person: "Bennett", golfer1: "Patrick Reed", golfer2: "Tyrrell Hatton" },
  { person: "Daniel", golfer1: "Viktor Hovland", golfer2: "Sepp Straka" },
  { person: "Blake", golfer1: "Patrick Cantlay", golfer2: "Shane Lowry" }
];

type ParsedPlayer = {
  name: string;
  score: number | null;
  scoreDisplay: string;
};

function normalizeName(name: string) {
  let n = name.toLowerCase().trim();
  const replacements: Record<string, string> = {
    aaberg: "åberg",
    hojgaard: "højgaard",
    valimaki: "välimäki",
    garcia: "garcía",
    "jose maria": "josé maría"
  };

  for (const [from, to] of Object.entries(replacements)) {
    n = n.replaceAll(from, to);
  }

  n = n.replace(/\s+\(a\)$/i, "");
  n = n.replace(/[^a-z0-9áéíóúäëïöüñåøæçãõýÿœ\- ]+/g, "");
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

function scoreToNum(raw: string) {
  const s = raw.trim().toUpperCase();
  if (!s || s === "--") return null;
  if (s === "E") return 0;
  const n = Number(s.replace("+", ""));
  return Number.isFinite(n) ? n : null;
}

function scoreDisplay(n: number | null) {
  if (n === null) return "";
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

async function parseLeaderboard() {
  const res = await fetch(ESPN_URL, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9"
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Leaderboard request failed with status ${res.status}`);
  }

  const html = await res.text();
  const marker = "POS PLAYER SCORE TODAY THRU R1 R2 R3 R4 TOT";
  const start = html.indexOf(marker);

  if (start === -1) {
    throw new Error("Could not find leaderboard on ESPN page.");
  }

  const section = html.slice(start, start + 30000);
  const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
  const players = new Map<string, ParsedPlayer>();

  for (const line of lines.slice(1)) {
    if (line.startsWith("Glossary") || line.startsWith("Latest Golf Videos")) {
      break;
    }

    const match = line.match(/【\d+†([^】]+)】([+\-E]?\d*|--)/);
    if (!match) continue;

    const name = match[1].trim();
    const score = scoreToNum(match[2].trim());

    players.set(normalizeName(name), {
      name,
      score,
      scoreDisplay: scoreDisplay(score)
    });
  }

  if (!players.size) {
    throw new Error("Loaded the page, but no player scores were parsed.");
  }

  return players;
}

export async function GET() {
  try {
    const players = await parseLeaderboard();
    const unmatched = new Set<string>();

    const results = PICKS.map((pick) => {
      const p1 = players.get(normalizeName(pick.golfer1));
      const p2 = players.get(normalizeName(pick.golfer2));

      if (pick.golfer1 && !p1) unmatched.add(pick.golfer1);
      if (pick.golfer2 && !p2) unmatched.add(pick.golfer2);

      const total =
        p1?.score === null && p2?.score === null
          ? null
          : (p1?.score ?? 0) + (p2?.score ?? 0);

      return {
        person: pick.person,
        golfer1: pick.golfer1,
        golfer2: pick.golfer2,
        score1Display: p1?.scoreDisplay ?? "",
        score2Display: p2?.scoreDisplay ?? "",
        totalDisplay: scoreDisplay(total),
        sortTotal: total ?? 9999
      };
    }).sort((a, b) => {
      if (a.sortTotal !== b.sortTotal) return a.sortTotal - b.sortTotal;
      return a.person.localeCompare(b.person);
    });

    return Response.json({
      ok: true,
      source: "ESPN Masters leaderboard",
      fetchedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium"
      }),
      playerCount: players.size,
      unmatched: Array.from(unmatched).sort(),
      results
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
