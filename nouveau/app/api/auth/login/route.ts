import { NextResponse } from "next/server";
import { authenticate } from "@/lib/ldap";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    // Vérification de l'identité auprès de l'annuaire (Active Directory).
    const resultat = await authenticate(username, password);

    if (!resultat.ok) {
      return NextResponse.json(
        { success: false, message: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Connexion réussie. (La gestion des accès par table et la session
    // seront ajoutées plus tard.)
    return NextResponse.json({
      success: true,
      user: {
        username,
        nomComplet: resultat.nomComplet ?? username,
        email: resultat.email ?? "",
      },
    });
  } catch (err) {
    console.error("Erreur login :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
