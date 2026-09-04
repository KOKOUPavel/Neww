
export type DefinitionTable = {
  cle: string;
  libelle: string;
  colonnes: string[];
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