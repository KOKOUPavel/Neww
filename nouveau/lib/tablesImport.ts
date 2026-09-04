// ─────────────────────────────────────────────────────────────
// lib/tablesImport.ts
// Définition des tables importables : colonnes et libellé.
// Sert à la fois au front (aperçu, menu) et au back (liste blanche).
// ─────────────────────────────────────────────────────────────

export type DefinitionTable = {
  cle: string; // identifiant technique (== nom de la table SQL)
  libelle: string; // nom affiché dans le menu
  colonnes: string[]; // colonnes attendues, dans l'ordre
};

export const TABLES: Record<string, DefinitionTable> = {
  equipment: {
    cle: "equipment",
    libelle: "Équipements",
    colonnes: [
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
    ],
  },
  eligibility: {
    cle: "eligibility",
    libelle: "Éligibilité",
    colonnes: ["msisdn"],
  },
  consultant: {
    cle: "consultant",
    libelle: "Consultants",
    colonnes: [
      "id",
      "firstname",
      "lastname",
      "consultant_number",
      "authorize",
      "created_at",
      "can_swap",
    ],
  },
};

export const TABLES_AUTORISEES = Object.keys(TABLES);