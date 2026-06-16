import { RARITY_CONFIG } from '@/lib/boosterEngine'
import clsx from 'clsx'

{
  "name": "CyclistCard",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nom complet du coureur"
    },
    "nationality": {
      "type": "string",
      "description": "Nationalit\u00e9 du coureur"
    },
    "team": {
      "type": "string",
      "description": "\u00c9quipe UCI actuelle"
    },
    "photo_url": {
      "type": "string",
      "description": "URL de la photo du coureur"
    },
    "rarity": {
      "type": "string",
      "enum": [
        "common",
        "uncommon",
        "rare",
        "epic",
        "legendary"
      ],
      "description": "Niveau de raret\u00e9 de la carte"
    },
    "specialty": {
      "type": "string",
      "enum": [
        "grimpeur",
        "sprinteur",
        "rouleur",
        "puncheur",
        "baroudeur",
        "classicman"
      ],
      "description": "Sp\u00e9cialit\u00e9 du coureur"
    },
    "stats_climbing": {
      "type": "number",
      "description": "Stat escalade (0-100)"
    },
    "stats_sprint": {
      "type": "number",
      "description": "Stat sprint (0-100)"
    },
    "stats_endurance": {
      "type": "number",
      "description": "Stat endurance (0-100)"
    },
    "stats_time_trial": {
      "type": "number",
      "description": "Stat contre-la-montre (0-100)"
    },
    "stats_attack": {
      "type": "number",
      "description": "Stat attaque (0-100)"
    },
    "stats_overall": {
      "type": "number",
      "description": "Note globale (0-100)"
    },
    "palmares": {
      "type": "string",
      "description": "Palmar\u00e8s principal du coureur"
    },
    "grand_tours_won": {
      "type": "number",
      "description": "Nombre de grands tours gagn\u00e9s"
    },
    "monuments_won": {
      "type": "number",
      "description": "Nombre de monuments gagn\u00e9s"
    },
    "stage_wins": {
      "type": "number",
      "description": "Nombre de victoires d'\u00e9tapes en grands tours"
    },
    "collection_set": {
      "type": "string",
      "enum": [
        "legends",
        "peloton_2024",
        "sprinters_elite",
        "king_of_mountains",
        "classics_masters",
        "time_trial_kings"
      ],
      "description": "Collection \u00e0 laquelle appartient la carte"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Si la carte est active dans le jeu"
    }
  },
  "required": [
    "name",
    "rarity",
    "stats_overall"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": "admin"
      }
    },
    "read": {},
    "update": {
      "user_condition": {
        "role": "admin"
      }
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}
