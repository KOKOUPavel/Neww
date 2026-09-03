import { NextResponse } from "next/server";
import sql from "mssql";

const config: sql.config = {
  server: process.env.SQL_SERVER ?? "",
  database: process.env.SQL_DATABASE ?? "",
  user: process.env.SQL_USER ?? "",
  password: process.env.SQL_PASSWORD ?? "",
  port: Number(process.env.SQL_PORT ?? 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const COLONNES = [
  "id",
  "imei",
  "date",
  "created_at",
  "equipment",
  "option",
  "available",
  "sold",
  "sale_date",
  "price",
  "ratioMontantJour",
];

function valeurOuNull(v: string): string | null {
  if (v == null) return null;
  const t = v.trim();
  if (t === "" || t.toUpperCase() === "NULL") return null;
  return t;
}

export async function POST(request: Request) {
  let pool: sql.ConnectionPool | null = null;
  try {
    const { lignes } = (await request.json()) as {
      lignes: Record<string, string>[];
    };

    if (!Array.isArray(lignes) || lignes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Aucune donnée à insérer." },
        { status: 400 }
      );
    }

    pool = await sql.connect(config);

    let inserees = 0;
    for (const ligne of lignes) {
      const req = pool.request();
      for (const col of COLONNES) {
        req.input(col, valeurOuNull(ligne[col] ?? ""));
      }
      const placeholders = COLONNES.map((c) => `@${c}`).join(", ");
      const colonnesSql = COLONNES.map((c) => `[${c}]`).join(", ");
      await req.query(
        `INSERT INTO equipment (${colonnesSql}) VALUES (${placeholders})`
      );
      inserees += 1;
    }

    return NextResponse.json({ success: true, inserees });
  } catch (err) {
    console.error("Erreur insertion equipment :", err);
    const message =
      err instanceof Error ? err.message : "Erreur inconnue à l'insertion.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
}