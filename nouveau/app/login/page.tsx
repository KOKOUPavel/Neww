"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!username.trim() || !password) {
      setErreur("Renseignez votre identifiant et votre mot de passe.");
      return;
    }

    setChargement(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErreur(data.message ?? "Identifiant ou mot de passe incorrect.");
        setChargement(false);
        return;
      }

      router.push("/accueil");
    } catch (err) {
      console.error(err);
      setErreur("Impossible de contacter le serveur. Réessayez.");
      setChargement(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.mark} aria-hidden="true">
            <i className="ti ti-shield-lock" />
          </span>
          <h1 className={styles.title}>Connexion à l&apos;annuaire</h1>
          <p className={styles.subtitle}>
            Utilisez votre identifiant réseau habituel.
          </p>
        </div>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          {erreur && (
            <div className={styles.error} role="alert">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              <span>{erreur}</span>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="username">Identifiant</label>
            <div className={styles.inputWrap}>
              <i className="ti ti-user" aria-hidden="true" />
              <input
                id="username"
                type="text"
                placeholder="prenom.nom"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <div className={styles.inputWrap}>
              <i className="ti ti-lock" aria-hidden="true" />
              <input
                id="password"
                type={voirMdp ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setVoirMdp((v) => !v)}
                aria-label={
                  voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
              >
                <i
                  className={voirMdp ? "ti ti-eye-off" : "ti ti-eye"}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Rester connecté
            </label>
          </div>

          <button type="submit" className={styles.submit} disabled={chargement}>
            {chargement ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className={styles.foot}>
          <i className="ti ti-server" aria-hidden="true" />
          Authentification via l&apos;annuaire de l&apos;entreprise (LDAP)
        </div>
      </div>
    </main>
  );
}
