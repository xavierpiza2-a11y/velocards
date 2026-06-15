
Tous les projets
jeu de carte UCI
créer une app de jeu de carte a collectionner, sur le theme vélo UCI

Claude Fable 5 is currently unavailable.
En savoir plus(opens in new tab)


Comment puis-je vous aider ?


Correction d'affichage d'image sur les cartes
Dernier message il y a 4 minutes
c'est partie, je veux que l'on...
Dernier message il y a 16 heures
Mémoire
Vous uniquement
Purpose & context Xavier is building VéloCards UCI Pro, a cycling-themed collectible card opening web app inspired by UCI professional cycling. The goal is a polished, functional app where users can collect and open virtual cards featuring real pro cyclists. Tech stack: React + Vite, Tailwind CSS (custom gold/black design system), Firebase (Auth, Firestore, Storage), Cloudflare Pages hosting, GitHub Actions CI/CD, Zustand for auth state, Framer Motion for card reveal animations. Key architectural decisions: cardNumber as the unique upsert key for CSV imports Semicolon as CSV separator for Excel compatibility Admin role set manually in Firestore initially Auth supports Google and Email/Password via Firebase --- Current state The core architecture is fully established and deployed. Active work is on ProCyclingStats (PCS) integration via the Parse.bot API: A SyncModal component and pcsSync.js library are being built in the admin panel The sync flow fetches WorldTour riders by season, assigns rarity based on ranking, guesses specialty from name/team heuristics, and offers CSV download or direct Firestore import Resolved issues: Cloudflare Pages output directory misconfiguration (.vitepress/dist → dist) GitHub Actions gitHubToken permission issue (parameter removed) Missing CLOUDFLAREACCOUNTID and CLOUDFLAREAPITOKEN secrets (added) Cloudflare/GitHub disconnection (reconnected via Cloudflare Pages settings) Cyclist and team name spelling errors corrected against official 2025 Tour de France startlist A Parse.bot API key was exposed in chat — Xavier was advised to revoke and regenerate it, storing the new one only as a GitHub Secret named VITEPARSEBOTSAPI_KEY. --- On the horizon Completing the PCS sync modal and full ProCyclingStats integration Potential expansion of the card dataset beyond the 2025 Tour de France riders (184 cards currently loaded) Likely future work on the card opening/pack reveal experience using Framer Motion --- Key learnings & principles Validate plans before implementation — Xavier prefers reviewing the approach before code is written API keys and secrets belong in GitHub Secrets, never in chat or source code Official source data (e.g., official Tour de France startlists) should be used to validate and correct CSV datasets --- Approach & patterns Works iteratively with step-by-step guidance when navigating external dashboards (Firebase Console, Cloudflare Dashboard, GitHub Settings) Communicates directly and concisely Prefers modal-based UX patterns for admin workflows (import preview modals, sync modals) Validates data before committing (CSV import shows preview before confirming) --- Tools & resources Frontend: React, Vite, Tailwind CSS, Zustand, Framer Motion Backend: Firebase Auth, Firestore, Firebase Storage Hosting/CI: Cloudflare Pages, GitHub Actions Data/API: Parse.bot API key for ProCyclingStats; official Tour de France startlist data for cyclist records

Dernière mise à jour il y a 8 heures

Instructions
tu est un développeur d'application web, tu veux créer une app de jeu de carte a collectionner style booster de carte a ouvrir, le style de l'app doit être avec des couleur or et noir mais assez moderne. un compte administrateur doit pouvoir créer et modifier les cartes, ainsi que tout les paramètres associé au développement de l'app.

Fichiers

.gitignore
7 lignes

gitignore



.firebaserc
7 lignes

text



vite.config.js
17 lignes

js



package-lock.json
6 770 lignes

json



storage.rules
21 lignes

text



postcss.config.js
7 lignes

js



firestore.rules
54 lignes

text



tailwind.config.js
84 lignes

js



index.html
21 lignes

html



README.md
143 lignes

md



firestore.indexes.json
38 lignes

json



firebase.json
10 lignes

json



package.json
36 lignes

json



.env.example
12 lignes

text



main.jsx
11 lignes

jsx



App.jsx
82 lignes

jsx



utils.css
2 lignes

css



globals.css
137 lignes

css



MarketPage.jsx
22 lignes

jsx



LoginPage.jsx
143 lignes

jsx



HomePage.jsx
113 lignes

jsx



CollectionPage.jsx
125 lignes

jsx



BoostersPage.jsx
83 lignes

jsx



AdminUsers.jsx
111 lignes

jsx



AdminPage.jsx
59 lignes

jsx



AdminCards.jsx
652 lignes

jsx



AdminBoosters.jsx
193 lignes

jsx



pcsSync.js
199 lignes

js



firestore.js
171 lignes

js



firebase.js
25 lignes

js



csvImport.js
270 lignes

js



boosterEngine.js
73 lignes

js



useAuthStore.js
81 lignes

js



Layout.jsx
95 lignes

jsx



AuthGuard.jsx
20 lignes

jsx



AdminGuard.jsx
13 lignes

jsx



CyclistCard.jsx
133 lignes

jsx



BoosterOpener.jsx
171 lignes

jsx



BoosterCard.jsx
62 lignes

jsx



_redirects
3 lignes

text



deploy.yml
48 lignes

yml



coureursuci2025.csv
csv


CyclistCard.jsx
import { RARITY_CONFIG } from '@/lib/boosterEngine'
import clsx from 'clsx'
 
const SPECIALITY_ICON = {
  climber:  '⛰️',
  sprinter: '⚡',
  rouleur:  '🔄',
  puncheur: '👊',
  gc:       '🏆',
}
 
export default function CyclistCard({ card, revealed = true, size = 'md', className = '' }) {
  if (!card) return null
 
  const rc = RARITY_CONFIG[card.rarity] ?? RARITY_CONFIG.common
  const isLegendary = card.rarity === 'legendary'
 
  const sizeClasses = {
    sm: 'w-24 h-36 text-[8px]',
    md: 'w-36 h-52 text-[10px]',
    lg: 'w-48 h-72 text-xs',
  }
 
  const statBar = (value, max = 100) => (
    <div className="stat-bar-bg">
      <div className="stat-bar-fill" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  )
 
  if (!revealed) {
    return (
      <div className={clsx(
        'relative rounded-xl border border-gold-dark/60 bg-noir-50 flex items-center justify-center',
        'cursor-default select-none',
        sizeClasses[size],
        className,
      )}>
        <div className="text-center">
          <div className="font-display tracking-widest text-gold-400/30" style={{ fontSize: '0.6rem' }}>
            VÉLOCARDS
          </div>
          <div className="text-xl mt-1">🚴</div>
        </div>
      </div>
    )
  }
 
  return (
    <div className={clsx(
      'relative rounded-xl border flex flex-col overflow-hidden select-none',
      'transition-transform duration-200 hover:scale-[1.03]',
      rc.border, rc.bg,
      isLegendary && 'shadow-legendary card-legendary-shine',
      sizeClasses[size],
      className,
    )}>
      {/* Header rareté */}
      <div className={clsx('flex items-center justify-between px-2 pt-2 pb-1', rc.color)}>
        <span className="font-mono tracking-widest" style={{ fontSize: '0.55rem' }}>
          {card.cardNumber ?? '—'}
        </span>
        <span className={clsx('rarity-badge', `rarity-${card.rarity}`)}>
          {rc.label.toUpperCase()}
        </span>
      </div>
 
      {/* Image coureur (placeholder si pas d'image) */}
      <div className="flex-1 mx-2 rounded-lg bg-noir-200 overflow-hidden flex items-center justify-center relative">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1">
              {SPECIALITY_ICON[card.speciality] ?? '🚴'}
            </div>
            <div className={clsx('font-mono', rc.color)} style={{ fontSize: '0.5rem' }}>
              {card.nationality ?? '??'}
            </div>
          </div>
        )}
        {isLegendary && (
          <div className="absolute inset-0 bg-gradient-to-t from-gold-400/10 to-transparent pointer-events-none" />
        )}
      </div>
 
      {/* Nom + équipe */}
      <div className="px-2 pt-1.5">
        <div className={clsx('font-display tracking-wide leading-none truncate', rc.color)}
             style={{ fontSize: size === 'sm' ? '0.55rem' : '0.7rem' }}>
          {card.name}
        </div>
        <div className="font-mono text-gold-400/40 truncate" style={{ fontSize: '0.5rem' }}>
          {card.team}
        </div>
      </div>
 
      {/* Stats (masquées en taille sm) */}
      {size !== 'sm' && card.stats && (
        <div className="px-2 py-1.5 space-y-0.5">
          {[
            { key: 'climbing',  label: 'GRI' },
            { key: 'sprint',    label: 'SPR', max: 2000 },
            { key: 'endurance', label: 'END' },
          ].map(({ key, label, max = 100 }) => (
            <div key={key} className="flex items-center gap-1">
              <span className="font-mono text-gold-400/30 w-5 shrink-0" style={{ fontSize: '0.5rem' }}>
                {label}
              </span>
              <div className="flex-1">
                {statBar(card.stats[key] ?? 0, max)}
              </div>
              <span className="font-mono text-gold-400/50 w-6 text-right shrink-0" style={{ fontSize: '0.5rem' }}>
                {card.stats[key] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
 
      {/* Numéro de saison */}
      <div className="px-2 pb-1.5 text-right">
        <span className="font-mono text-gold-400/20" style={{ fontSize: '0.45rem' }}>
          {card.season ?? 2025}
        </span>
      </div>
    </div>
  )
}
 
