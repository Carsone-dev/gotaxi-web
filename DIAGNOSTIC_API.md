# GoTaxi Backend — Diagnostic API Global

> **Date :** 2026-06-09  
> **Stack :** FastAPI · PostgreSQL · Redis · JWT (RS256)  
> **Base URL :** `/api/v1`  
> **Auth :** Bearer token (OAuth2)

---

## Rôles & Statuts utilisateur

| Rôle | Description |
|------|-------------|
| `CLIENT` | Passager / expéditeur — **rôle attribué par défaut à l'inscription** |
| `CHAUFFEUR` | Conducteur — **compte créé exclusivement par l'administration via le backoffice** |
| `ADMIN` | Administrateur backoffice |
| `SUPER_ADMIN` | Super administrateur (tous les droits admin) |

| Statut | Description |
|--------|-------------|
| `ACTIF` | Compte actif |
| `SUSPENDU` | Compte suspendu par un admin |
| `EN_ATTENTE_KYC` | En attente de validation des documents (chauffeur) |
| `SUPPRIME` | Compte supprimé (soft delete) |

> **Règle métier critique :** L'inscription publique (`POST /auth/register`) crée toujours un compte `CLIENT`. La création d'un compte `CHAUFFEUR` est une action d'administration : l'admin enregistre le chauffeur via le backoffice (`POST /auth/register/chauffeur`), soumet ses documents, et valide le KYC. Le chauffeur ne peut passer en ligne qu'après `kyc_valide = true`.

---

## 1. ACCÈS PUBLIC (sans authentification)

Ces endpoints sont accessibles à tous, sans token.

### Système

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/public/health` | Healthcheck applicatif |
| GET | `/public/health/db` | Healthcheck base de données |

### Données publiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/public/villes` | Liste des villes desservies |
| GET | `/public/stats` | Statistiques globales de la plateforme |
| GET | `/public/voyages/search` | Recherche de voyages disponibles |
| GET | `/public/colis/{code_suivi}` | Suivi d'un colis par code de tracking |
| GET | `/voyages/popular` | Voyages populaires |
| GET | `/avis/chauffeur/{chauffeur_id}` | Avis d'un chauffeur (lecture publique) |

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | **Inscription** — crée un compte CLIENT par défaut |
| POST | `/auth/login` | Connexion (retourne access + refresh token) |
| POST | `/auth/otp/send` | Envoi d'un code OTP par SMS |
| POST | `/auth/otp/verify` | Vérification OTP & activation du numéro |
| POST | `/auth/refresh` | Rafraîchissement du token d'accès |
| POST | `/auth/password/forgot` | Demande de réinitialisation du mot de passe |
| POST | `/auth/password/reset` | Confirmation du nouveau mot de passe |

---

## 2. CLIENT (rôle par défaut)

Tout utilisateur inscrit est CLIENT. Ces endpoints couvrent son cycle complet : profil, réservations, colis, wallet et avis.

### Profil & Compte

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users/me` | Voir son profil |
| PATCH | `/users/me` | Modifier son profil |
| DELETE | `/users/me` | Supprimer son compte (soft delete) |
| POST | `/users/me/photo` | Uploader sa photo de profil |
| POST | `/users/me/fcm-token` | Enregistrer le token push (Firebase) |
| POST | `/auth/logout` | Déconnexion (blacklist du token) |
| POST | `/auth/password/change` | Changer son mot de passe |

### Recherche & Consultation

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/voyages/search` | Rechercher un voyage disponible |
| GET | `/voyages/colis-search` | Rechercher un voyage pour envoyer un colis |
| GET | `/voyages/{voyage_id}` | Voir le détail d'un voyage |
| GET | `/users/{user_id}` | Voir le profil public d'un utilisateur |
| GET | `/chauffeurs/{chauffeur_id}` | Voir le profil public d'un chauffeur |
| GET | `/chauffeurs/{chauffeur_id}/voyages` | Voir les voyages d'un chauffeur |

### Réservations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/reservations` | Créer une réservation sur un voyage |
| GET | `/reservations/me` | Lister ses réservations |
| GET | `/reservations/{reservation_id}` | Voir le détail d'une réservation |
| POST | `/reservations/{reservation_id}/cancel` | Annuler une réservation |

### Colis (expéditeur)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/colis` | Créer un envoi de colis |
| GET | `/colis/me` | Lister mes colis |
| GET | `/colis/{colis_id}` | Détail d'un colis |
| POST | `/colis/{colis_id}/annuler` | Annuler un colis en attente |

### Wallet & Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/wallet/me` | Voir son solde |
| GET | `/wallet/me/activity` | Historique des mouvements du wallet |
| POST | `/wallet/me/recharge/initiate` | Initier une recharge (MTN / Orange / Moov) |
| POST | `/wallet/me/recharge/confirm` | Confirmer le paiement de la recharge |
| POST | `/wallet/me/withdraw` | Retrait vers mobile money |
| POST | `/wallet/me/transfer` | Transfert vers un autre utilisateur |
| GET | `/transactions/me` | Historique des transactions |
| GET | `/transactions/{transaction_id}` | Détail d'une transaction |

### Avis & Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/avis` | Laisser un avis (1 à 5 étoiles) |
| GET | `/users/me/avis` | Avis que j'ai reçus |
| GET | `/avis/me/recus` | Avis reçus (détail complet) |
| POST | `/avis/{avis_id}/signaler` | Signaler un avis inapproprié |
| GET | `/notifications/me` | Mes notifications |
| GET | `/notifications/me/unread-count` | Nombre de notifications non lues |
| POST | `/notifications/me/read-all` | Tout marquer comme lu |
| POST | `/notifications/{notif_id}/read` | Marquer une notification comme lue |
| DELETE | `/notifications/{notif_id}` | Supprimer une notification |

---

## 3. CHAUFFEUR (compte créé par l'administration)

Le chauffeur est un utilisateur dont le rôle a été promu à `CHAUFFEUR` par l'administration. Il doit obligatoirement avoir `kyc_valide = true` avant de pouvoir passer en ligne ou créer des voyages.

### Flux d'activation d'un chauffeur

```
Admin inscrit le chauffeur (POST /auth/register/chauffeur)
        ↓
Chauffeur configure son profil (POST /chauffeurs/me/setup)
        ↓
Chauffeur upload ses documents (POST /chauffeurs/me/documents)
        ↓
Admin valide le KYC (POST /admin/chauffeurs/{id}/validate-kyc)
        ↓
Chauffeur peut passer en ligne (POST /chauffeurs/me/online)
```

### Profil & Documents KYC

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/chauffeurs/me/setup` | Initialiser son profil chauffeur |
| GET | `/chauffeurs/me` | Voir son profil chauffeur |
| PATCH | `/chauffeurs/me` | Modifier son profil chauffeur |
| POST | `/chauffeurs/me/documents` | Uploader CIN, permis, casier judiciaire |

### Flotte de véhicules

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/chauffeurs/me/vehicules` | Lister ses véhicules |
| POST | `/chauffeurs/me/vehicules` | Ajouter un véhicule |
| PATCH | `/chauffeurs/me/vehicules/{vehicule_id}` | Modifier un véhicule |
| DELETE | `/chauffeurs/me/vehicules/{vehicule_id}` | Supprimer un véhicule |

### Disponibilité & Position

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/chauffeurs/me/online` | Passer en ligne *(KYC requis)* |
| POST | `/chauffeurs/me/offline` | Passer hors ligne |
| POST | `/chauffeurs/me/position` | Mettre à jour sa position GPS |

### Gestion des voyages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/voyages` | Créer un voyage *(KYC requis)* |
| GET | `/voyages/me` | Lister mes voyages |
| PATCH | `/voyages/{voyage_id}` | Modifier un voyage publié |
| POST | `/voyages/{voyage_id}/start` | Démarrer un voyage (PUBLIE → EN_COURS) |
| POST | `/voyages/{voyage_id}/end` | Terminer un voyage (EN_COURS → TERMINÉ) |
| POST | `/voyages/{voyage_id}/cancel` | Annuler un voyage |
| GET | `/voyages/{voyage_id}/reservations` | Voir les réservations de mon voyage |
| GET | `/voyages/{voyage_id}/passagers` | Voir les passagers confirmés |

### Gestion des réservations reçues

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/reservations/me/incoming` | Réservations entrantes (en attente / confirmées) |
| GET | `/reservations/{reservation_id}` | Détail d'une réservation |
| POST | `/reservations/{reservation_id}/accept` | Accepter une réservation (EN_ATTENTE → CONFIRMÉE) |
| POST | `/reservations/{reservation_id}/reject` | Refuser une réservation |
| POST | `/reservations/{reservation_id}/cancel` | Annuler une réservation confirmée |

### Gestion des colis transportés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/colis/voyage/{voyage_id}` | Colis associés à mon voyage |
| GET | `/colis/{colis_id}` | Détail d'un colis |
| POST | `/colis/{colis_id}/confirmer` | Accepter un colis (EN_ATTENTE → CONFIRMÉ) |
| POST | `/colis/{colis_id}/annuler` | Refuser / annuler un colis |
| POST | `/colis/{colis_id}/en_transit` | Marquer en transit (CONFIRMÉ → EN_TRANSIT) |
| POST | `/colis/{colis_id}/livrer` | Confirmer la livraison (EN_TRANSIT → LIVRÉ) |

### Revenus & Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/chauffeurs/me/revenus` | Voir ses revenus |
| GET | `/chauffeurs/me/stats` | Statistiques personnelles (trajets, notes…) |

---

## 4. ADMINISTRATION (`ADMIN` / `SUPER_ADMIN`)

L'administration a une vue globale sur toute l'activité de la plateforme et est le seul acteur capable de créer des comptes chauffeurs et de valider les KYC.

> Tous les endpoints `/admin/*` nécessitent le rôle `ADMIN` ou `SUPER_ADMIN`. Toutes les actions admin sont tracées dans la table `AuditLog`.

### Dashboard & Indicateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/dashboard/overview` | Vue d'ensemble : totaux utilisateurs, voyages, colis, chauffeurs |
| GET | `/admin/dashboard/kpis` | KPIs : nouveaux inscrits, voyages actifs, revenus générés |
| GET | `/admin/dashboard/revenus` | Courbe des revenus sur 7j / 30j / 90j |
| GET | `/admin/dashboard/top-trajets` | Top 10 des routes les plus empruntées |
| GET | `/admin/dashboard/activity-feed` | Fil d'activité récent (inscriptions, voyages, colis) |
| GET | `/admin/dashboard/momo-stats` | Stats des transactions Mobile Money par opérateur (MTN / Orange / Moov) |
| GET | `/admin/fleet` | Snapshot temps réel : chauffeurs en ligne + voyages en cours |

### Gestion des utilisateurs

> C'est ici que l'admin gère proprement les comptes : création de chauffeurs, suspension, activation, validation KYC.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register/chauffeur` | **Créer un compte chauffeur** (admin uniquement en pratique) |
| GET | `/admin/users` | Lister tous les utilisateurs (filtre par rôle / statut / recherche) |
| GET | `/admin/users/{user_id}` | Détail complet d'un utilisateur |
| POST | `/admin/users/{user_id}/suspend` | Suspendre un compte |
| POST | `/admin/users/{user_id}/activate` | Réactiver un compte suspendu |
| POST | `/admin/users/{user_id}/validate-kyc` | Valider le KYC via l'ID utilisateur |

### Gestion des chauffeurs & KYC

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/chauffeurs` | Lister les chauffeurs (filtre KYC / statut en ligne) |
| GET | `/admin/chauffeurs/{user_id}` | Détail d'un chauffeur (profil + user + véhicules) |
| POST | `/admin/chauffeurs/{chauffeur_id}/validate-kyc` | **Valider le KYC** → débloque la mise en ligne |
| POST | `/admin/chauffeurs/{chauffeur_id}/reject-kyc` | **Rejeter le KYC** avec motif |

### Gestion des voyages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/voyages` | Lister tous les voyages (filtre par statut) |
| GET | `/admin/voyages/{voyage_id}` | Détail d'un voyage avec ses réservations |

### Gestion des colis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/colis/pending` | Colis en attente de traitement |
| GET | `/admin/colis/in-transit` | Colis actuellement en transit |
| GET | `/admin/colis/{colis_id}` | Détail d'un colis |
| POST | `/admin/colis/{colis_id}/validate` | Valider un colis |
| POST | `/admin/colis/{colis_id}/reject` | Rejeter un colis |

### Gestion des réservations & transactions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/reservations` | Lister toutes les réservations (filtre par statut / voyage) |
| GET | `/admin/transactions` | Lister toutes les transactions (filtre par statut / type) |

### Modération des avis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/avis` | Lister les avis (filtre par signalements) |
| POST | `/admin/avis/{avis_id}/masquer` | Masquer un avis signalé |

### Audit & Traçabilité

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/audit` | Consulter les logs d'audit de toutes les actions admin |

---

## 5. Récapitulatif par nombre d'endpoints

| Acteur | Endpoints |
|--------|-----------|
| Public (sans auth) | 15 |
| Client | 33 |
| Chauffeur | 30 |
| Administration | 27 |
| **Total** | **~90** |

---

## 6. Points d'attention & recommandations

### Sécurité

- [ ] `POST /auth/register/chauffeur` est actuellement ouvert publiquement — **à protéger derrière une authentification admin** pour respecter la règle métier "seul l'admin crée les chauffeurs".
- [ ] Les tokens JWT utilisent RS256 avec paire de clés RSA — s'assurer que `JWT_PRIVATE_KEY_PATH` n'est jamais exposé.
- [ ] Le blacklist des tokens à la déconnexion passe par Redis — vérifier le TTL aligné sur `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`.

### Fonctionnel

- [ ] Le chauffeur ne peut pas passer en ligne sans `kyc_valide = true` → l'admin doit valider les documents avant tout démarrage d'activité.
- [ ] Les positions GPS des chauffeurs sont broadcastées via WebSocket (`tracking:voyage:{id}` et `admin:fleet`) — endpoint WS à documenter séparément.
- [ ] Trois opérateurs Mobile Money supportés : **MTN MoMo**, **Orange Money**, **Moov Money**.

### Architecture

- [ ] Toutes les actions admin sont auditées en base (`AuditLog`) — prévoir un nettoyage ou archivage périodique.
- [ ] La suppression de compte est un **soft delete** (`statut = SUPPRIME`) — les données sont conservées pour l'audit.
