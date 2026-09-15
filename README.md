# Kheper — déploiement

> **État au 16/09/2026 : déployé.** Site : https://diaks.github.io/kheper/ — dépôts `Diaks/kheper` (public, Pages activé sur `main` / root, HTTPS imposé) et `Diaks/kheper-data` (privé). Jetons : `kheper-app` (Contents R/W sur `kheper-data`, sans expiration, utilisé par l'app) et `kheper-deploy` (temporaire, expire le 23/09/2026, a servi au push et peut être supprimé). Le dossier `~/Documents/kheper/installation/` contient le QR code et le lien de configuration pour le téléphone.

Deux dépôts sur le compte **Diaks** :

| Dépôt | Visibilité | Contenu |
|---|---|---|
| `kheper` | public | le site (ce dossier), servi par GitHub Pages |
| `kheper-data` | **privé** | un seul fichier `data.json`, écrit par l'app |

## 1. Tester en local (avant tout)

Dans ce dossier :

```bash
python3 -m http.server 8080
# ou : npx serve .
```

Ouvre `http://localhost:8080` sur le Mac. Pour tester sur le téléphone en local, utilise l'IP du Mac (`http://192.168.x.x:8080`) : tout fonctionne sauf l'installation PWA et le service worker, qui exigent HTTPS (GitHub Pages le fournit).

## 2. Dépôt `kheper` (le site)

Le dossier est déjà un dépôt git (branche `main`, un commit « Kheper v1 », `atelier.html` ignoré). Il reste à créer le dépôt distant et à pousser :

1. https://github.com/new → nom `kheper`, **Public**, sans README ni .gitignore → Create repository.
2. Dans le Terminal du Mac :

```bash
cd ~/Documents/kheper/app
git remote add origin https://github.com/Diaks/kheper.git
git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch → Branch : `main` / `(root)` → Save**. Après une à deux minutes, le site est à :

```
https://diaks.github.io/kheper/
```

Le `manifest.json` et le `sw.js` utilisent des chemins relatifs (`./`), donc le sous-dossier `/kheper/` ne pose aucun problème.

### Mettre à jour le site

À chaque modification de `index.html` : incrémente `VERSION` dans `sw.js` (`kheper-v1.0.1`, …) et dans `index.html` (`const VERSION`), commit, push. Le service worker charge la page réseau d'abord, donc l'app installée récupère la nouvelle version à l'ouverture suivante (parfois après une fermeture complète de l'app).

## 3. Dépôt `kheper-data` (les données)

`~/Documents/kheper/kheper-data/` est aussi déjà un dépôt git avec un `data.json` vide valide.

1. https://github.com/new → nom `kheper-data`, **Private**, sans README → Create repository.
2. Terminal :

```bash
cd ~/Documents/kheper/kheper-data
git remote add origin https://github.com/Diaks/kheper-data.git
git push -u origin main
```

## 4. Le jeton (fine-grained personal access token)

GitHub → photo de profil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.

- **Token name** : `kheper`
- **Expiration** : 1 an (ou « No expiration » si proposé) — note la date, l'app affichera « jeton refusé (401) » le jour où il expire
- **Repository access** : *Only select repositories* → `kheper-data` uniquement
- **Permissions → Repository permissions → Contents : Read and write** (rien d'autre ; *Metadata* passe en lecture automatiquement)

Copie le jeton (`github_pat_…`) : il n'est affiché qu'une fois.

## 5. Dans l'app

Deux façons : (a) ouvrir le lien de configuration `https://diaks.github.io/kheper/#cfg=<base64 de {"owner","repo","token"}>` — l'app enregistre la synchro et efface le hash (c'est ce que fait le QR code du dossier `installation/`) ; (b) Réglages → **Synchronisation GitHub** : compte `Diaks`, dépôt `kheper-data`, colle le jeton, **Enregistrer**. L'indicateur en haut à droite passe à « synchronisé ». Le jeton reste dans le stockage local du téléphone, jamais dans `data.json`.

## 6. Installer sur Android

Chrome → `https://diaks.github.io/kheper/` → menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »). Ouvre-la depuis l'icône : plein écran, hors ligne, données locales + GitHub.

## Structure

```
index.html      tout le code (moteur, interface, animations)
manifest.json   installation PWA
sw.js           cache hors ligne (page réseau d'abord, images cache d'abord, API GitHub jamais mise en cache)
img/*.webp      les 11 formes, 768×889
icon-192.png    icônes
icon-512.png
```
