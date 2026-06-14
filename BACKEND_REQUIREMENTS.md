# GoTaxi — Recommandations Backend pour le Backoffice Admin

> Généré le 2026-06-09  
> Ces endpoints sont **déjà câblés côté frontend** (`apps/admin`).  
> Le frontend les appelle avec les bons paramètres — il suffit que le backend les supporte pour que les fonctionnalités s'activent automatiquement.

---

## Priorité 1 — Bloquant (Phase 2, fonctionnalités partiellement visibles)

### 1.1 Filtrer les réservations par client

**Endpoint existant à enrichir :**
```
GET /api/v1/admin/reservations
```

**Paramètre à ajouter :**
```
client_id: str (UUID) — optionnel
```

**Comportement attendu :**  
Quand `client_id` est fourni, retourner uniquement les réservations où `reservation.client_id = client_id`.

**Situation actuelle :**  
Le frontend envoie déjà `?client_id=<uuid>` mais le backend ignore ce paramètre et retourne toutes les réservations. Un filtre client-side compense en attendant (sur 50 items max — risque de données manquantes si l'utilisateur a plus de 50 réservations).

**Impact :** Onglet **Réservations** dans la page détail d'un utilisateur.

---

### 1.2 Filtrer les colis par expéditeur

**Endpoint à créer :**
```
GET /api/v1/admin/colis
```

**Paramètres :**
```
expediteur_id: str (UUID) — optionnel
page: int = 1
size: int = 20
```

**Comportement attendu :**  
Retourner les colis dont `colis.expediteur_id = expediteur_id`, paginés.

**Schéma de réponse :**
```json
{
  "items": [ ColisRead ],
  "total": 42,
  "page": 1,
  "size": 20,
  "pages": 3
}
```

**Situation actuelle :**  
Le frontend envoie `?expediteur_id=<uuid>` sur `GET /admin/colis` mais cet endpoint n'existe pas encore. L'onglet **Colis** retourne vide jusqu'à l'implémentation.

**Impact :** Onglet **Colis** dans la page détail d'un utilisateur.

---

### 1.3 Filtrer les transactions par utilisateur

**Endpoint existant à enrichir :**
```
GET /api/v1/admin/transactions
```

**Paramètre à ajouter :**
```
user_id: str (UUID) — optionnel
```

**Comportement attendu :**  
Quand `user_id` est fourni, retourner uniquement les transactions du wallet de cet utilisateur.

**Situation actuelle :**  
Le frontend envoie `?user_id=<uuid>` mais le backend retourne toutes les transactions. L'onglet **Transactions** dans le détail utilisateur affiche des données non filtrées.

**Impact :** Onglet **Transactions** dans la page détail d'un utilisateur.

---

### 1.4 Suppression d'un compte (soft delete)

**Endpoint à créer :**
```
DELETE /api/v1/admin/users/{user_id}
```

**Auth :** `ADMIN` ou `SUPER_ADMIN`

**Comportement attendu :**
- Passer `user.statut` à `SUPPRIME`
- Ne pas supprimer physiquement les données (conservation pour l'audit)
- Blacklister les tokens actifs de l'utilisateur (via Redis)
- Créer une entrée dans `AuditLog`

**Réponse :**
```json
{ "message": "Compte supprimé" }
```

**Situation actuelle :**  
Le bouton **Supprimer le compte** est présent dans le backoffice mais renvoie une erreur 404/405 jusqu'à l'implémentation de cet endpoint.

**Impact :** Bouton **Zone dangereuse > Supprimer le compte** dans la page détail d'un utilisateur.

---

## Priorité 2 — Important (Phase 3, chauffeur)

### 2.1 Revenus ventilés d'un chauffeur

**Endpoint à créer :**
```
GET /api/v1/admin/chauffeurs/{user_id}/revenus
```

**Auth :** `ADMIN` ou `SUPER_ADMIN`

**Réponse attendue :**
```json
{
  "aujourd_hui": 15000,
  "semaine":     87500,
  "mois":        320000,
  "total":       1850000
}
```

*(Montants en FCFA)*

**Impact :** Onglet **Revenus** dans la page détail d'un chauffeur (Phase 3).

---

### 2.2 Toggle autorisation transfrontalière

**Endpoint existant à enrichir :**
```
PATCH /api/v1/admin/chauffeurs/{user_id}
```

**Body à accepter :**
```json
{ "autorisation_transfrontaliere": true }
```

**Comportement attendu :**  
Mettre à jour `chauffeur.autorisation_transfrontaliere`. Créer une entrée dans `AuditLog`.

**Impact :** Bouton **Autoriser / Révoquer transfrontalier** dans la page détail d'un chauffeur (Phase 3).

---

### 2.3 Voyages d'un chauffeur (admin)

**Endpoint existant à enrichir :**
```
GET /api/v1/admin/voyages
```

**Paramètre à ajouter :**
```
chauffeur_id: str (UUID) — optionnel
```

**Impact :** Onglet **Voyages** dans la page détail d'un chauffeur (Phase 3).

---

## Priorité 2b — Gestion des véhicules (Phase 3, chauffeur)

### 2.4 Activer / Désactiver un véhicule

**Endpoint à créer :**
```
PATCH /api/v1/admin/vehicules/{vehicule_id}
```

**Auth :** `ADMIN` ou `SUPER_ADMIN`

**Body :**
```json
{ "actif": false }
```

**Comportement attendu :**  
Mettre à jour `vehicule.actif`. Un véhicule inactif ne peut pas être sélectionné pour de nouveaux voyages. Créer une entrée dans `AuditLog`.

**Réponse :**
```json
{ "message": "Véhicule mis à jour" }
```

**Impact :** Bouton **Désactiver / Activer** sur chaque véhicule dans l'onglet Profil & KYC du détail chauffeur.

---

### 2.5 Supprimer un véhicule

**Endpoint à créer :**
```
DELETE /api/v1/admin/vehicules/{vehicule_id}
```

**Auth :** `ADMIN` ou `SUPER_ADMIN`

**Comportement attendu :**  
- Vérifier qu'aucun voyage `EN_COURS` n'utilise ce véhicule avant de supprimer.
- Suppression physique (pas de soft delete sur les véhicules).
- Créer une entrée dans `AuditLog`.

**Réponse :**
```json
{ "message": "Véhicule supprimé" }
```

**Impact :** Bouton **Supprimer** avec confirmation sur chaque véhicule dans l'onglet Profil & KYC du détail chauffeur.

---

## Priorité 3 — Utile (Phase 4, actions globales)

### 3.1 Annuler une réservation (action admin)

**Endpoint à créer :**
```
POST /api/v1/admin/reservations/{reservation_id}/cancel
```

**Body :**
```json
{ "reason": "string" }
```

**Comportement attendu :**  
Passer `reservation.statut` à `ANNULEE`. Notifier le client et le chauffeur. Créer une entrée dans `AuditLog`.

---

### 3.2 Annuler un voyage (action admin)

**Endpoint à créer :**
```
POST /api/v1/admin/voyages/{voyage_id}/cancel
```

**Body :**
```json
{ "reason": "string" }
```

**Comportement attendu :**  
Passer `voyage.statut` à `ANNULE`. Annuler toutes les réservations associées. Rembourser les passagers. Notifier tous les participants. Créer une entrée dans `AuditLog`.

---

### 3.3 Restaurer un avis masqué

**Endpoint à créer :**
```
POST /api/v1/admin/avis/{avis_id}/restaurer
```

**Comportement attendu :**  
Repasser `avis.visible` à `true`. Complémentaire à `POST /admin/avis/{id}/masquer` qui existe déjà.

---

## Récapitulatif des endpoints

| Priorité | Méthode | Endpoint | Action | Statut |
|----------|---------|----------|--------|--------|
| 🔴 P1 | GET | `/admin/reservations` | Ajouter param `client_id` | ⏳ À faire |
| 🔴 P1 | GET | `/admin/colis` | Créer avec param `expediteur_id` | ⏳ À faire |
| 🔴 P1 | GET | `/admin/transactions` | Ajouter param `user_id` | ⏳ À faire |
| 🔴 P1 | DELETE | `/admin/users/{id}` | Créer — soft delete | ⏳ À faire |
| 🟠 P2 | GET | `/admin/chauffeurs/{id}/revenus` | Créer | ⏳ À faire |
| 🟠 P2 | PATCH | `/admin/chauffeurs/{id}` | Ajouter `autorisation_transfrontaliere` | ⏳ À faire |
| 🟠 P2 | GET | `/admin/voyages` | Ajouter param `chauffeur_id` | ⏳ À faire |
| 🟠 P2b | PATCH | `/admin/vehicules/{id}` | Créer — activer/désactiver | ⏳ À faire |
| 🟠 P2b | DELETE | `/admin/vehicules/{id}` | Créer — suppression | ⏳ À faire |
| 🟡 P3 | POST | `/admin/reservations/{id}/cancel` | Créer | ⏳ À faire |
| 🟡 P3 | POST | `/admin/voyages/{id}/cancel` | Créer | ⏳ À faire |
| 🟡 P3 | POST | `/admin/avis/{id}/restaurer` | Créer | ⏳ À faire |

---

## Rappel : schémas de réponse paginée

Tous les endpoints de liste admin doivent retourner ce schéma pour être compatibles avec le frontend :

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20,
  "pages": 0
}
```

Type TypeScript côté frontend : `PaginatedResponse<T>` (défini dans `apps/admin/src/types/domain.ts`).
