"use client";

import { useState, useRef } from "react";
import { TABLES, type DefinitionTable } from "@/lib/tablesImport";
import styles from "./import.module.css";

type LigneImport = Record<string, string>;

function detecterSeparateur(ligne: string): string {
  const candidats = [",", ";", "\t"];
  let meilleur = ",";
  let maxCount = 0;
  for (const c of candidats) {
    const n = ligne.split(c).length - 1;
    if (n > maxCount) {
      maxCount = n;
      meilleur = c;
    }
  }
  return meilleur;
}

function decouper(ligne: string, sep: string): string[] {
  const cellules: string[] = [];
  let courant = "";
  let dansGuillemets = false;
  for (let i = 0; i < ligne.length; i += 1) {
    const ch = ligne[i];
    if (ch === '"') {
      dansGuillemets = !dansGuillemets;
    } else if (ch === sep && !dansGuillemets) {
      cellules.push(courant);
      courant = "";
    } else {
      courant += ch;
    }
  }
  cellules.push(courant);
  return cellules.map((c) => c.trim());
}

export default function ImportPage() {
  const clesTables = Object.keys(TABLES);
  const [tableCle, setTableCle] = useState<string>(clesTables[0]);
  const def: DefinitionTable = TABLES[tableCle];

  const [nomFichier, setNomFichier] = useState<string | null>(null);
  const [entetes, setEntetes] = useState<string[]>([]);
  const [lignes, setLignes] = useState<LigneImport[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reinitialiser() {
    setNomFichier(null);
    setEntetes([]);
    setLignes([]);
    setErreur(null);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function changerTable(cle: string) {
    setTableCle(cle);
    reinitialiser();
  }

  function onFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setErreur(null);
    setMessage(null);

    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const texte = String(lecteur.result ?? "");
        const toutesLignes = texte
          .split(/\r?\n/)
          .filter((l) => l.trim() !== "");

        if (toutesLignes.length === 0) {
          setErreur("Le fichier est vide.");
          return;
        }

        const sep = detecterSeparateur(toutesLignes[0]);
        const tete = decouper(toutesLignes[0], sep);

        const donnees: LigneImport[] = [];
        for (let i = 1; i < toutesLignes.length; i += 1) {
          const valeurs = decouper(toutesLignes[i], sep);
          const ligne: LigneImport = {};
          tete.forEach((col, idx) => {
            ligne[col] = valeurs[idx] ?? "";
          });
          donnees.push(ligne);
        }

        setNomFichier(fichier.name);
        setEntetes(tete);
        setLignes(donnees);
      } catch {
        setErreur("Impossible de lire le fichier. Vérifiez son format.");
      }
    };
    lecteur.onerror = () => setErreur("Erreur de lecture du fichier.");
    lecteur.readAsText(fichier);
  }

  async function exporterVersBase() {
    setEnvoi(true);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: tableCle, lignes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErreur(data.message ?? "L'insertion a échoué.");
        return;
      }
      setMessage(
        `${data.inserees} ligne${data.inserees > 1 ? "s" : ""} insérée${
          data.inserees > 1 ? "s" : ""
        } dans ${def.libelle}.`
      );
    } catch (err) {
      console.error(err);
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setEnvoi(false);
    }
  }

  const colonnesInconnues = entetes.filter((c) => !def.colonnes.includes(c));

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Importer des données</h1>
        <p className={styles.subtitle}>
          Choisissez le type, chargez un fichier CSV ou TXT, vérifiez
          l&apos;aperçu, puis envoyez les données vers la base.
        </p>
      </header>

      {/* Menu de sélection de la table */}
      <section className={styles.typeRow}>
        {clesTables.map((cle) => (
          <button
            key={cle}
            className={`${styles.typeBtn} ${
              cle === tableCle ? styles.typeBtnActive : ""
            }`}
            onClick={() => changerTable(cle)}
          >
            {TABLES[cle].libelle}
          </button>
        ))}
      </section>

      {}
      {lignes.length === 0 && (
        <section className={styles.dropzone}>
          <i className="ti ti-file-spreadsheet" aria-hidden="true" />
          <p className={styles.dropTitle}>Choisir un fichier</p>
          <p className={styles.dropHint}>
            Format CSV ou TXT · colonnes attendues : {def.colonnes.join(", ")}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={onFichier}
            className={styles.fileInput}
            id="fichier"
          />
          <label htmlFor="fichier" className={styles.fileButton}>
            Parcourir…
          </label>
        </section>
      )}

      {erreur && (
        <div className={styles.error} role="alert">
          <i className="ti ti-alert-circle" aria-hidden="true" />
          <span>{erreur}</span>
        </div>
      )}

      {/* Aperçu */}
      {lignes.length > 0 && (
        <section className={styles.apercu}>
          <div className={styles.apercuHead}>
            <div>
              <p className={styles.fichierNom}>
                <i className="ti ti-file-check" aria-hidden="true" />
                {nomFichier}
              </p>
              <p className={styles.apercuInfo}>
                {def.libelle} · {lignes.length} ligne
                {lignes.length > 1 ? "s" : ""} · {entetes.length} colonne
                {entetes.length > 1 ? "s" : ""}
              </p>
            </div>
            <button className={styles.btnGhost} onClick={reinitialiser}>
              <i className="ti ti-x" aria-hidden="true" />
              Changer de fichier
            </button>
          </div>

          {colonnesInconnues.length > 0 && (
            <div className={styles.avertissement}>
              <i className="ti ti-alert-triangle" aria-hidden="true" />
              <span>
                Colonnes non reconnues : {colonnesInconnues.join(", ")}. Elles
                ne correspondent pas à la table {def.libelle}.
              </span>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {entetes.map((col) => (
                    <th
                      key={col}
                      className={
                        def.colonnes.includes(col) ? "" : styles.colInconnue
                      }
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne, i) => (
                  <tr key={i}>
                    {entetes.map((col) => (
                      <td key={col}>{ligne[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={exporterVersBase}
              disabled={envoi}
            >
              <i className="ti ti-database-import" aria-hidden="true" />
              {envoi ? "Envoi en cours…" : "Exporter vers la base"}
            </button>
            {message && <span className={styles.message}>{message}</span>}
          </div>
        </section>
      )}
    </main>
  );
}