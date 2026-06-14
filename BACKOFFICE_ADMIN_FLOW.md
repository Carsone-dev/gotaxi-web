# GoTaxi — Diagnostic & Flow Complet du Backoffice Admin

> Généré le 2026-06-09 | Stack : React 18 + React Query v5 + Zustand + Axios | API : FastAPI `/api/v1`

---

## Table des matières

1. [Architecture actuelle](#1-architecture-actuelle)
2. [Modules existants — état réel](#2-modules-existants--état-réel)
3. [Actions sur un CLIENT (backoffice)](#3-actions-sur-un-client-backoffice)
4. [Actions sur un CHAUFFEUR (backoffice)](#4-actions-sur-un-chauffeur-backoffice)
5. [Gaps critiques identifiés](#5-gaps-critiques-identifiés)
6. [Plan de mise en conformité backend ↔ frontend](#6-plan-de-mise-en-conformité-backend--frontend)
7. [Endpoints backend attendus](#7-endpoints-backend-attendus)
8. [Matrice de couverture complète](#8-matrice-de-couverture-complète)

---

## 1. Architecture actuelle

```
apps/admin/src/
├── routes/                        # Pages (React Router v6, lazy-loaded)
│   ├── login.tsx                  ✅ Opérationnel
│   ├── dashboard.tsx              ✅ KPIs + revenue + fleet summary
│   ├── users/
│   │   ├── index.tsx              ✅ Liste + filtres role/statut/search
│   │   └── [id].tsx               ⚠️  Partiellement opérationnel
│   ├── chauffeurs/
│   │   ├── index.tsx              ✅ Liste + filtre kyc/online
│   │   ├── [id].tsx               ❌ Bugué — utilise API publique au lieu d'admin
│   │   └── kyc-pending.tsx        ⚠️  Dépend du fix de [id].tsx
│   ├── voyages/[id].tsx           ⚠️  Pas d'actions admin (annuler un voyage)
│   ├── colis/
│   │   ├── pending.tsx            ✅ Valider / Rejeter avec motif
│   │   ├── in-transit.tsx         ✅ Vue en transit
│   │   └── [id].tsx               ⚠️  Pas d'actions admin
│   ├── reservations/index.tsx     ⚠️  Vue seule, pas d'actions
│   ├── transactions/index.tsx     ⚠️  Vue globale, pas de détail par user
│   ├── reviews/
│   │   ├── index.tsx              ✅ Masquer un avis
│   │   └── disputes.tsx           ⚠️  Dépend de useAdmin.ts complet
│   ├── audit/index.tsx            ✅ Logs SUPER_ADMIN
│   ├── fleet.tsx                  ✅ Carte temps réel + WebSocket
│   └── settings/index.tsx         ⚠️  Squelette vide
│
├── lib/api/admin.ts               ⚠️  Incomplet (manque delete, edit, wallet, docs)
├── hooks/useAdmin.ts              ⚠️  Manque useAdminTransactions, useDeleteUser
└── types/domain.ts                ✅ Complet
```

---

## 2. Modules existants — état réel

| Module | Page | API admin wired | Mutations actives | État |
|---|---|---|---|---|
| Dashboard KPIs | `dashboard.tsx` | ✅ `/admin/dashboard/kpis` | — | ✅ OK |
| Revenue chart | `dashboard.tsx` | ✅ `/admin/dashboard/revenus` | — | ✅ OK |
| Top routes | `dashboard.tsx` | ✅ `/admin/dashboard/top-trajets` | — | ✅ OK |
| Activity feed | `dashboard.tsx` | ✅ `/admin/dashboard/activity-feed` | — | ✅ OK |
| MoMo stats | `dashboard.tsx` | ✅ `/admin/dashboard/momo-stats` | — | ✅ OK |
| Liste users | `users/index.tsx` | ✅ `/admin/users` | — | ✅ OK |
| Détail user | `users/[id].tsx` | ✅ `/admin/users/:id` | Suspendre, Réactiver | ⚠️ Partiel |
| Liste chauffeurs | `chauffeurs/index.tsx` | ✅ `/admin/chauffeurs` | — | ✅ OK |
| **Détail chauffeur** | `chauffeurs/[id].tsx` | ❌ Utilise `/users/:id` public | Valider KYC seulement | ❌ BUGUÉ |
| KYC pending | `chauffeurs/kyc-pending.tsx` | ❌ Dépend du détail | — | ❌ À fixer |
| Colis en attente | `colis/pending.tsx` | ✅ `/admin/colis/pending` | Valider, Rejeter | ✅ OK |
| Colis en transit | `colis/in-transit.tsx` | ✅ `/admin/colis/in-transit` | — | ✅ OK |
| Réservations | `reservations/index.tsx` | ✅ `/admin/reservations` | ❌ Aucune | ⚠️ Vue seule |
| Transactions | `transactions/index.tsx` | ❌ Pas de hook admin | ❌ Aucune | ❌ Non branché |
| Avis | `reviews/index.tsx` | ✅ `/admin/avis` | Masquer | ✅ OK |
| Disputes | `reviews/disputes.tsx` | ⚠️ Filtre signalé | — | ⚠️ Partiel |
| Audit logs | `audit/index.tsx` | ✅ `/admin/audit` | — | ✅ OK |
| Fleet live | `fleet.tsx` | ✅ WebSocket + fallback REST | — | ✅ OK |

---

## 3. Actions sur un CLIENT (backoffice)

> Un CLIENT est un utilisateur avec `role = "CLIENT"`.
> Toutes les actions ci-dessous doivent être accessibles depuis `routes/users/[id].tsx`.

### 3.1 Consultation (lecture)

| # | Action | Endpoint | État actuel |
|---|---|---|---|
| C1 | Voir profil complet (nom, prénom, tel, email, photo, langue) | `GET /admin/users/:id` | ✅ Implémenté |
| C2 | Voir statut du compte (ACTIF / SUSPENDU / EN_ATTENTE_KYC / SUPPRIME) | inclus dans C1 | ✅ Implémenté |
| C3 | Voir date d'inscription et téléphone vérifié | inclus dans C1 | ✅ Implémenté |
| C4 | Voir note moyenne + nombre d'avis | inclus dans C1 | ✅ Implémenté |
| C5 | Voir historique des réservations du client | `GET /admin/reservations?client_id=:id` | ⚠️ Fait par filtre client-side (inefficace) |
| C6 | Voir les colis envoyés par le client | `GET /admin/colis?expediteur_id=:id` | ❌ Manquant |
| C7 | Voir le solde wallet et l'historique transactions | `GET /admin/users/:id/wallet` | ❌ Manquant |
| C8 | Voir les avis laissés par le client | `GET /admin/avis?auteur_id=:id` | ❌ Manquant |

### 3.2 Actions modératives

| # | Action | Endpoint | Payload | État actuel |
|---|---|---|---|---|
| A1 | **Suspendre le compte** | `POST /admin/users/:id/suspend` | `{ reason: string }` | ✅ Implémenté |
| A2 | **Réactiver le compte** | `POST /admin/users/:id/activate` | — | ✅ Implémenté |
| A3 | **Supprimer le compte** (soft delete → statut SUPPRIME) | `DELETE /admin/users/:id` | — | ❌ Manquant |
| A4 | Modifier les infos (nom, prénom, email) par override admin | `PATCH /admin/users/:id` | `{ nom?, prenom?, email? }` | ❌ Manquant |
| A5 | Annuler une réservation active du client | `POST /admin/reservations/:id/cancel` | `{ reason: string }` | ❌ Manquant |
| A6 | Rembourser une transaction | `POST /admin/transactions/:id/refund` | `{ montant?: number }` | ❌ Manquant |
| A7 | Masquer / restaurer un avis laissé par le client | `POST /admin/avis/:id/masquer` | — | ⚠️ Masquer existe, restaurer manque |

### 3.3 Notes internes admin

| # | Action | Endpoint | État actuel |
|---|---|---|---|
| N1 | Ajouter une note interne sur le compte | `POST /admin/users/:id/notes` | ❌ Non modélisé |
| N2 | Voir l'historique des actions admin sur ce compte | `GET /admin/audit?target_id=:id` | ⚠️ Audit existe mais pas filtré par user |

---

## 4. Actions sur un CHAUFFEUR (backoffice)

> Un CHAUFFEUR a `role = "CHAUFFEUR"` et un enregistrement `ChauffeurRead` lié.
> Point d'entrée principal : `routes/chauffeurs/[id].tsx`
> **BUG CRITIQUE :** cette page utilise `usersApi.publicProfile` et `chauffeursApi.publicProfile` au lieu de `adminApi.chauffeurDetail`.

### 4.1 Consultation (lecture)

| # | Action | Endpoint | État actuel |
|---|---|---|---|
| CH1 | Voir profil complet (user + chauffeur) | `GET /admin/chauffeurs/:id` | ❌ BUGUÉ — utilise endpoint public |
| CH2 | Voir statut KYC (validé / en attente / rejeté) | inclus dans CH1 | ⚠️ Partiel (données incomplètes) |
| CH3 | Voir les **photos de documents KYC** (CIN, permis, casier) | urls dans `ChauffeurRead` | ❌ Pas d'affichage des images |
| CH4 | Voir la liste des véhicules | inclus dans CH1 | ✅ OK (si fix CH1) |
| CH5 | Voir les stats (trajets, revenus, note) | inclus dans CH1 | ✅ OK (si fix CH1) |
| CH6 | Voir les voyages publiés/effectués | `GET /admin/voyages?chauffeur_id=:id` | ❌ Manquant |
| CH7 | Voir les colis livrés | `GET /admin/colis?chauffeur_id=:id` | ❌ Manquant |
| CH8 | Voir position sur la carte fleet | `GET /admin/fleet` (carte globale) | ✅ Via fleet.tsx |
| CH9 | Voir revenus ventilés (jour / semaine / mois) | `GET /admin/chauffeurs/:id/revenus` | ❌ Manquant |

### 4.2 Gestion KYC — workflow complet

```
[Chauffeur soumet docs]
         │
         ▼
   statut: EN_ATTENTE_KYC
   kyc_valide: false
         │
   Admin ouvre chauffeurs/[id].tsx
         │
    ┌────┴─────┐
    │          │
 [Valider]  [Rejeter avec motif]
    │          │
    ▼          ▼
 kyc_valide  email/SMS notif
   = true    + statut reste EN_ATTENTE_KYC
   statut → ACTIF
```

| # | Action | Endpoint | Payload | État actuel |
|---|---|---|---|---|
| KYC1 | **Valider le KYC** | `POST /admin/chauffeurs/:id/validate-kyc` | — | ✅ Mutation existe, UI présente |
| KYC2 | **Rejeter le KYC avec motif** | `POST /admin/chauffeurs/:id/reject-kyc` | `{ reason: string }` | ⚠️ Mutation existe, **UI manquante** |
| KYC3 | Voir document CIN (image) | url `chauffeur.cin_url` | ❌ Image viewer absent |
| KYC4 | Voir document permis (image) | url `chauffeur.permis_url` | ❌ Image viewer absent |
| KYC5 | Voir casier judiciaire (image) | url `chauffeur.casier_judiciaire_url` | ❌ Image viewer absent |
| KYC6 | Valider l'autorisation transfrontalière | `PATCH /admin/chauffeurs/:id` | `{ autorisation_transfrontaliere: true }` | ❌ Manquant |

### 4.3 Actions modératives

| # | Action | Endpoint | Payload | État actuel |
|---|---|---|---|---|
| M1 | **Suspendre le chauffeur** | `POST /admin/users/:id/suspend` | `{ reason: string }` | ⚠️ Accessible via users/[id] seulement |
| M2 | **Réactiver le chauffeur** | `POST /admin/users/:id/activate` | — | ⚠️ Accessible via users/[id] seulement |
| M3 | Désactiver un véhicule | `PATCH /admin/vehicules/:id` | `{ actif: false }` | ❌ Manquant |
| M4 | Supprimer un véhicule frauduleux | `DELETE /admin/vehicules/:id` | — | ❌ Manquant |
| M5 | Annuler un voyage en cours | `POST /admin/voyages/:id/cancel` | `{ reason: string }` | ❌ Manquant |
| M6 | Forcer la déconnexion (mettre hors ligne) | `POST /admin/chauffeurs/:id/force-offline` | — | ❌ Non modélisé |

### 4.4 Revenus et transactions

| # | Action | Endpoint | État actuel |
|---|---|---|---|
| R1 | Voir revenus chauffeur (jour/semaine/mois/total) | `GET /admin/chauffeurs/:id/revenus` | ❌ Manquant |
| R2 | Voir l'historique des transactions wallet | `GET /admin/users/:id/transactions` | ❌ Manquant |
| R3 | Émettre un remboursement manuel | `POST /admin/transactions/:id/refund` | ❌ Manquant |

---

## 5. Gaps critiques identifiés

### 5.1 Bug bloquant — Page détail chauffeur

**Fichier :** `apps/admin/src/routes/chauffeurs/[id].tsx`

**Problème :** La page utilise les API publiques au lieu des API admin :
```typescript
// ❌ ACTUEL — données publiques limitées
queryFn: () => usersApi.publicProfile(id!)        // GET /users/:id/public
queryFn: () => chauffeursApi.publicProfile(id!)   // GET /chauffeurs/:id/public

// ✅ À REMPLACER PAR
queryFn: () => adminApi.chauffeurDetail(id!)      // GET /admin/chauffeurs/:id
```
Le hook `useAdminChauffeurDetail` existe dans `hooks/useAdmin.ts` mais **n'est pas utilisé** dans la page.

### 5.2 Mutation sans UI — Rejeter KYC

**Fichier :** `hooks/useAdmin.ts` ligne 138 — `useRejectKyc` existe.
**Problème :** Aucun bouton "Rejeter KYC" ni formulaire de motif dans `chauffeurs/[id].tsx`.

### 5.3 Hook manquant — Transactions admin

**Fichier :** `lib/api/admin.ts` ligne 61 — `adminApi.allTransactions` existe.
**Problème :** Aucun hook `useAdminTransactions` dans `hooks/useAdmin.ts`. La page `transactions/index.tsx` ne peut pas s'y connecter.

### 5.4 Fetch inefficace — Réservations par client

**Fichier :** `routes/users/[id].tsx` ligne 37
```typescript
// ❌ Charge 50 réservations et filtre côté client
get<{ items: ReservationRead[] }>("/admin/reservations", { size: 50 })
select: (d) => d.items.filter((r) => r.client?.id === id)

// ✅ Doit utiliser le paramètre server-side
get<...>("/admin/reservations", { client_id: id, size: 20 })
```

### 5.5 Viewer documents KYC absent

Les URLs `cin_url`, `permis_url`, `casier_judiciaire_url` existent dans `ChauffeurRead` mais aucun composant ne les affiche. L'admin ne peut pas visualiser les pièces pour valider.

### 5.6 Actions de suspension absentes dans la page chauffeur

La page `chauffeurs/[id].tsx` n'a pas de boutons Suspendre/Réactiver. L'admin doit aller sur `users/[id].tsx` pour ça — friction inutile.

### 5.7 Page settings vide

`routes/settings/index.tsx` est un squelette sans contenu opérationnel.

---

## 6. Plan de mise en conformité backend ↔ frontend

### Phase 1 — Corrections critiques (bugs bloquants)

| Priorité | Tâche | Fichiers touchés |
|---|---|---|
| 🔴 P1 | Corriger `chauffeurs/[id].tsx` → utiliser `useAdminChauffeurDetail` | `chauffeurs/[id].tsx` |
| 🔴 P1 | Ajouter UI "Rejeter KYC" avec textarea motif | `chauffeurs/[id].tsx` |
| 🔴 P1 | Ajouter composant `KycDocumentViewer` (3 images cliquables) | nouveau composant |
| 🔴 P1 | Ajouter `useAdminTransactions` dans `hooks/useAdmin.ts` | `hooks/useAdmin.ts` |
| 🔴 P1 | Brancher `transactions/index.tsx` sur l'API admin | `transactions/index.tsx` |

### Phase 2 — Complétion des actions admin sur les users

| Priorité | Tâche | Fichiers touchés |
|---|---|---|
| 🟠 P2 | Ajouter Suspendre/Réactiver dans `chauffeurs/[id].tsx` | `chauffeurs/[id].tsx` |
| 🟠 P2 | Corriger fetch réservations → `client_id` server-side | `users/[id].tsx` |
| 🟠 P2 | Ajouter onglet "Colis" dans `users/[id].tsx` | `users/[id].tsx`, `api/admin.ts` |
| 🟠 P2 | Ajouter onglet "Transactions" dans `users/[id].tsx` | `users/[id].tsx`, `api/admin.ts` |
| 🟠 P2 | Ajouter `useDeleteUser` + bouton suppression (avec confirm dialog) | `hooks/useAdmin.ts`, `users/[id].tsx` |

### Phase 3 — Enrichissement chauffeur

| Priorité | Tâche | Fichiers touchés |
|---|---|---|
| 🟡 P3 | Onglet "Voyages" dans `chauffeurs/[id].tsx` | `chauffeurs/[id].tsx`, `api/admin.ts` |
| 🟡 P3 | Onglet "Revenus" avec breakdown jour/semaine/mois | `chauffeurs/[id].tsx`, `api/admin.ts` |
| 🟡 P3 | Actions sur véhicules (désactiver, supprimer) | `chauffeurs/[id].tsx`, `api/admin.ts` |
| 🟡 P3 | Toggle autorisation transfrontalière | `chauffeurs/[id].tsx`, `api/admin.ts` |

### Phase 4 — Actions globales

| Priorité | Tâche | Fichiers touchés |
|---|---|---|
| 🔵 P4 | Annuler une réservation depuis admin | `reservations/index.tsx`, `api/admin.ts` |
| 🔵 P4 | Annuler un voyage depuis admin | `voyages/[id].tsx`, `api/admin.ts` |
| 🔵 P4 | Page settings opérationnelle | `settings/index.tsx` |

---

## 7. Endpoints backend attendus

> Ces endpoints doivent exister ou être créés dans FastAPI. Préfixe : `/api/v1/admin`

### Endpoints déjà utilisés (à confirmer qu'ils existent)

```
GET    /admin/dashboard/overview
GET    /admin/dashboard/kpis
GET    /admin/dashboard/revenus?period=7d|30d|90d
GET    /admin/dashboard/top-trajets
GET    /admin/dashboard/activity-feed
GET    /admin/dashboard/momo-stats

GET    /admin/users                         ?page, size, statut, role, search
GET    /admin/users/:id
POST   /admin/users/:id/suspend             body: { reason }
POST   /admin/users/:id/activate

GET    /admin/chauffeurs                    ?kyc_valide, en_ligne, page, size
GET    /admin/chauffeurs/:id                → AdminChauffeurDetail { user, chauffeur }
POST   /admin/chauffeurs/:id/validate-kyc
POST   /admin/chauffeurs/:id/reject-kyc    body: { reason }

GET    /admin/colis/pending
GET    /admin/colis/in-transit
POST   /admin/colis/:id/validate
POST   /admin/colis/:id/reject             body: { reason }

GET    /admin/avis                         ?signale, page, size
POST   /admin/avis/:id/masquer

GET    /admin/reservations                 ?page, size, statut, voyage_id
GET    /admin/transactions                 ?page, size, statut, type
GET    /admin/audit                        ?page, size
```

### Endpoints manquants à créer

```
# Filtres par user
GET    /admin/reservations                 + param: client_id
GET    /admin/colis                        + params: expediteur_id, chauffeur_id
GET    /admin/transactions                 + param: user_id

# Wallet et revenus
GET    /admin/users/:id/wallet
GET    /admin/users/:id/transactions       ?page, size
GET    /admin/chauffeurs/:id/revenus       → { aujourd_hui, semaine, mois, total }

# Actions modératives
DELETE /admin/users/:id                    (soft delete → statut SUPPRIME)
PATCH  /admin/users/:id                    body: { nom?, prenom?, email? }
PATCH  /admin/chauffeurs/:id               body: { autorisation_transfrontaliere? }
POST   /admin/reservations/:id/cancel      body: { reason }
POST   /admin/voyages/:id/cancel           body: { reason }
POST   /admin/transactions/:id/refund      body: { montant? }

# Véhicules
PATCH  /admin/vehicules/:id               body: { actif: bool }
DELETE /admin/vehicules/:id

# Avis
POST   /admin/avis/:id/restaurer           (annuler masquage)

# Audit filtré
GET    /admin/audit                        + params: target_id, target_type, admin_id
```

---

## 8. Matrice de couverture complète

| Fonctionnalité | Frontend | Backend | Priorité | Status |
|---|:---:|:---:|:---:|---|
| Dashboard KPIs | ✅ | À vérifier | — | ✅ |
| Dashboard Revenue chart | ✅ | À vérifier | — | ✅ |
| Dashboard Fleet summary | ✅ | À vérifier | — | ✅ |
| Liste clients | ✅ | À vérifier | — | ✅ |
| Détail client — infos | ✅ | À vérifier | — | ✅ |
| Détail client — réservations | ⚠️ | À modifier | P2 | Inefficace |
| Détail client — colis | ❌ | ❌ manque param | P2 | À créer |
| Détail client — transactions | ❌ | ❌ manque endpoint | P2 | À créer |
| Détail client — avis laissés | ❌ | ❌ manque param | P3 | À créer |
| Suspendre client | ✅ | À vérifier | — | ✅ |
| Réactiver client | ✅ | À vérifier | — | ✅ |
| Supprimer client | ❌ | ❌ | P2 | À créer |
| Modifier infos client | ❌ | ❌ | P3 | À créer |
| Liste chauffeurs | ✅ | À vérifier | — | ✅ |
| **Détail chauffeur** | **❌ BUGUÉ** | À vérifier | **P1** | **Fix urgent** |
| Voir docs KYC (images) | ❌ | ✅ urls disponibles | **P1** | Composant manquant |
| Valider KYC | ✅ | À vérifier | — | ✅ |
| **Rejeter KYC** | **❌ UI manquante** | À vérifier | **P1** | **Fix urgent** |
| Toggle transfrontalier | ❌ | ❌ | P3 | À créer |
| Stats chauffeur | ⚠️ (si fix P1) | À vérifier | P1 | Dépend du fix |
| Voyages du chauffeur | ❌ | ❌ manque param | P3 | À créer |
| Revenus chauffeur | ❌ | ❌ | P3 | À créer |
| Suspendre chauffeur | ⚠️ seulement via /users | À vérifier | P2 | À intégrer |
| Véhicules — voir | ⚠️ (si fix P1) | À vérifier | P1 | Dépend du fix |
| Véhicules — désactiver | ❌ | ❌ | P3 | À créer |
| Colis pending — valider | ✅ | À vérifier | — | ✅ |
| Colis pending — rejeter | ✅ | À vérifier | — | ✅ |
| **Transactions — liste** | **❌ hook manquant** | À vérifier | **P1** | **Fix urgent** |
| Transactions par user | ❌ | ❌ | P2 | À créer |
| Remboursement | ❌ | ❌ | P4 | À créer |
| Avis — masquer | ✅ | À vérifier | — | ✅ |
| Avis — restaurer | ❌ | ❌ | P3 | À créer |
| Réservations — liste | ✅ | À vérifier | — | ✅ |
| Réservations — annuler | ❌ | ❌ | P4 | À créer |
| Voyages — annuler | ❌ | ❌ | P4 | À créer |
| Fleet live | ✅ | À vérifier | — | ✅ |
| Audit logs | ✅ | À vérifier | — | ✅ |
| Audit filtré par user | ❌ | ❌ manque param | P3 | À créer |

---

## Résumé des corrections immédiates (Phase 1)

```
1. chauffeurs/[id].tsx     → Remplacer usersApi.publicProfile + chauffeursApi.publicProfile
                               par useAdminChauffeurDetail(id)
                             → Ajouter bouton "Rejeter KYC" + textarea motif
                             → Ajouter composant KycDocumentViewer (cin_url, permis_url, casier_judiciaire_url)
                             → Ajouter Suspendre / Réactiver (même pattern que users/[id].tsx)

2. hooks/useAdmin.ts       → Ajouter useAdminTransactions(params)
                             → Ajouter useAdminAllTransactions (alias avec pagination)

3. transactions/index.tsx  → Brancher sur useAdminTransactions

4. users/[id].tsx          → Corriger le fetch réservations (ajouter client_id côté serveur)

5. lib/api/admin.ts        → Vérifier que GET /admin/chauffeurs/:id retourne bien
                               AdminChauffeurDetail { user: UserRead, chauffeur: ChauffeurRead }
```

---

*Ce document est la source de vérité pour le développement du backoffice GoTaxi. Mettre à jour au fur et à mesure des corrections.*
