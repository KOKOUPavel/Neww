

import ActiveDirectory from "activedirectory2";

export type ResultatAuth = {
  ok: boolean;
  nomComplet?: string;
  email?: string;
};

type EntreeAnnuaire = {
  displayName?: string;
  cn?: string;
  givenName?: string;
  sn?: string;
  mail?: string;
};

function config(userPrincipalName: string, password: string) {
  return {
    url: process.env.LDAP_URL ?? "",
    baseDN: process.env.LDAP_BASE_DN ?? "",
    username: userPrincipalName,
    password,
  };
}

function chercherUtilisateur(
  userPrincipalName: string,
  password: string,
  username: string
): Promise<EntreeAnnuaire | null> {
  return new Promise((resolve) => {
    const ad = new ActiveDirectory(config(userPrincipalName, password));

    ad.findUser(
      {
        attributes: [
          "displayName",
          "cn",
          "givenName",
          "sn",
          "mail",
          "sAMAccountName",
        ],
      },
      username,
      (err: unknown, user: EntreeAnnuaire | null) => {
        if (err) {
          console.error("LDAP findUser — échec :", err);
          resolve(null);
          return;
        }
        if (!user) {
          console.warn("LDAP findUser — aucune fiche trouvée pour", username);
          resolve(null);
          return;
        }
        resolve(user);
      }
    );
  });
}

function nomDepuisAnnuaire(user: EntreeAnnuaire): string | undefined {
  if (user.displayName) return user.displayName;
  if (user.cn) return user.cn;
  if (user.givenName || user.sn) {
    return [user.givenName, user.sn].filter(Boolean).join(" ");
  }
  return undefined;
}

/**
 * @param username
 * @param password
 */
export function authenticate(
  username: string,
  password: string
): Promise<ResultatAuth> {
  return new Promise((resolve) => {
    const domain = process.env.LDAP_DOMAIN ?? "";

    const userPrincipalName = username.includes("@")
      ? username
      : `${username}@${domain}`;
    const identifiantCourt = username.split("@")[0];

    const ad = new ActiveDirectory(config(userPrincipalName, password));

    ad.authenticate(
      userPrincipalName,
      password,
      async (err: unknown, auth: unknown) => {
        if (err || !auth) {
          if (err) console.error("Erreur LDAP :", err);
          resolve({ ok: false });
          return;
        }
        let user = await chercherUtilisateur(
          userPrincipalName,
          password,
          identifiantCourt
        );

        if (!user) {
          console.warn("LDAP findUser — nouvelle tentative…");
          user = await chercherUtilisateur(
            userPrincipalName,
            password,
            identifiantCourt
          );
        }

        if (!user) {
          resolve({ ok: true });
          return;
        }

        resolve({
          ok: true,
          nomComplet: nomDepuisAnnuaire(user),
          email: user.mail,
        });
      }
    );
  });
}
