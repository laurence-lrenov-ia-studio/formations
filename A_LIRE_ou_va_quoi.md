# Console formations — où va quoi (3 destinations)

## 1) GITHUB — héberge TOUT ce dossier
Dépose le contenu de ce dossier dans ton dépôt GitHub Pages (écrase les anciens fichiers).
Contenu : index.html · les 2 cockpits · les 2 supports · sw.js · manifest · icônes · le .json.
- Le service worker est passé en **réseau d'abord** : tes prochaines mises à jour
  s'affichent toutes seules quand tu es en ligne.
- Si une vieille version s'accroche la première fois : recharge en **Ctrl/Cmd + Maj + R** une fois.

## 2) GOOGLE SHEET / Apps Script — PAS sur GitHub
Fichier fourni à part : **cockpit_backend_AppsScript.gs**
- Extensions → Apps Script → **remplace tout le code** → garde le **même TOKEN**.
- Menu Exécuter → lance **setup_** une fois (Autoriser).
- Déployer → Gérer les déploiements → **Nouvelle version**. L'URL /exec ne change pas.

## 3) DANS LA CONSOLE — une fois, après l'hébergement
- Ouvre la console → **Importer** → **formations_sauvegarde.json** (déjà dans le dossier).
- À la 1re ouverture, tes 16 lignes amorcent le Google Sheet.

(Le .json est dans le dossier par commodité ; il sert au bouton **Importer**, pas à l'hébergement.)

## Ce qui a changé dans cette version
- Synchro A : tu écris dans l'appli OU dans le Sheet, fusion ligne par ligne, dernière modif gagne, plus d'écrasement.
- Nom des participants éditable ; Johann → Yoann.
- Jour J du 25 : cockpit du 25 lié + support du 25 (daté, avec intro positionnement).
- Service worker réseau-d'abord (fin du « ça ne se met pas à jour »).
