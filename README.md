# 🚴 VéloCards UCI Pro

Collection de cartes à collectionner sur le thème du cyclisme professionnel UCI.  
Stack : **React + Vite** · **Firebase** · **Cloudflare Pages** · **GitHub Actions**

---

## ⚡ Démarrage rapide

### 1. Cloner le repo
```bash
git clone https://github.com/TON_USERNAME/velocards.git
cd velocards
npm install
```

### 2. Créer le projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Créer un projet** → Nommer `velocards`
3. Activer **Authentication** → Sign-in methods → Google + Email/Password
4. Activer **Firestore Database** → Mode production
5. Activer **Storage**
6. Dans *Paramètres du projet → Config SDK web*, copier les valeurs

### 3. Variables d'environnement

```bash
cp .env.example .env
# Remplir les valeurs Firebase dans .env
```

### 4. Déployer les règles Firebase

```bash
npm install -g firebase-tools
firebase login
firebase use --add    # sélectionner le projet velocards
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Lancer en local

```bash
npm run dev
# → http://localhost:5173
```

---

## 🚀 Déploiement Cloudflare Pages

### Créer le projet Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Créer un projet
2. Connecter le repo GitHub `velocards`
3. Build settings :
   - **Framework preset** : Vite
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
4. Ajouter les variables d'environnement (mêmes que `.env`)

### GitHub Secrets (pour CI/CD automatique)

Dans **GitHub → Settings → Secrets → Actions**, ajouter :

| Secret | Valeur |
|--------|--------|
| `VITE_FIREBASE_API_KEY` | Clé API Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare (perm. Pages) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare |

Récupérer `CLOUDFLARE_API_TOKEN` : Cloudflare Dashboard → My Profile → API Tokens → Create Token → Cloudflare Pages (Edit).

---

## 🛡️ Premier compte Admin

1. S'inscrire normalement sur l'app
2. Dans Firebase Console → Firestore → `users` → trouver votre document
3. Modifier le champ `role` : `"user"` → `"admin"`

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── cards/        CyclistCard — affichage d'une carte
│   ├── boosters/     BoosterCard, BoosterOpener
│   └── layout/       Layout, AuthGuard, AdminGuard
├── hooks/
│   └── useAuthStore  Zustand — état d'authentification
├── lib/
│   ├── firebase.js   Initialisation Firebase
│   ├── firestore.js  Helpers Firestore + modèles de données
│   └── boosterEngine.js  Logique de tirage des cartes
├── pages/
│   ├── HomePage, BoostersPage, CollectionPage, MarketPage
│   ├── LoginPage
│   └── admin/        AdminPage, AdminCards, AdminBoosters, AdminUsers
└── styles/
    └── globals.css   Tokens design or/noir + composants Tailwind
```

---

## 🗂️ Modèle de données Firestore

```
cards/{cardId}
  name, team, nationality, rarity, season
  imageUrl, speciality, cardNumber
  stats: { ftp, sprint, climbing, endurance, ttRating }

boosters/{boosterId}
  name, description, price, cardCount, icon, active
  season, rarityRates: { guaranteedRarity }

users/{uid}
  displayName, email, photoURL, role, points
  /collection/{cardId} → { count, obtainedAt }

packs/{packId}
  uid, boosterId, cards[], openedAt
```

---

## 🗺️ Roadmap

- [x] **Phase 1** — Setup complet (Firebase + Cloudflare + CI/CD)
- [ ] **Phase 2** — 20 cartes UCI de démo + seed script
- [ ] **Phase 3** — Animation ouverture booster + effets holo
- [ ] **Phase 4** — Marché d'échange + doublons
- [ ] **Phase 5** — Classements, défis, saisons
