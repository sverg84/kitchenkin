type CookieJar = { getAll(): { name: string; value: string }[] };

/**
 * Reconstruct the Auth.js / NextAuth v5 database session token from
 * `cookies()` (handles chunked `*.0`, `*.1`, … cookies).
 */
export function readAuthJsSessionToken(jar: CookieJar): string | null {
  const prefixes = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
  ] as const;

  for (const prefix of prefixes) {
    const chunks: Record<string, string> = {};
    for (const { name, value } of jar.getAll()) {
      if (!value) continue;
      if (name !== prefix && !name.startsWith(`${prefix}.`)) continue;
      chunks[name] = value;
    }
    const keys = Object.keys(chunks);
    if (keys.length === 0) continue;

    keys.sort((a, b) => {
      const aSuffix = Number.parseInt(a.split(".").pop() || "0", 10);
      const bSuffix = Number.parseInt(b.split(".").pop() || "0", 10);
      const aOrder = Number.isFinite(aSuffix) ? aSuffix : -1;
      const bOrder = Number.isFinite(bSuffix) ? bSuffix : -1;
      return aOrder - bOrder;
    });

    return keys.map((k) => chunks[k]!).join("");
  }

  return null;
}
