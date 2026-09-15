# Kheper — déploiement

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

```bash
cd ~/Documents/kheper/app
git init -b main
git add index.html manifest.json sw.js icon-192.png icon-512.png img/ README.md
git commit -m "Kheper v1"
gh repo create Diaks/kheper --public --source=. --push
# sans gh : crée le dépôt vide sur github.com puis
# git remote add origin git@github.com:Diaks/kheper.git && git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch → Branch : `main` / `(root)` → Save**. Après une à deux minutes, le site est à :

```
https://diaks.github.io/kheper/
```

Le `manifest.json` et le `sw.js` utilisent des chemins relatifs (`./`), donc le sous-dossier `/kheper/` ne pose aucun problème.

### Mettre à jour le site

À chaque modification de `index.html` : incrémente `VERSION` dans `sw.js` (`kheper-v1.0.1`, …) et dans `index.html` (`const VERSION`), commit, push. Le service worker charge la page réseau d'abord, donc l'app installée récupère la nouvelle version à l'ouverture suivante (parfois après une fermeture complète de l'app).

## 3. Dépôt `kheper-data` (les données)

Crée-le **privé**, avec un README ou vide, peu importe : l'app crée `data.json` elle-même au premier push s'il n'existe pas. Si tu préfères partir d'un fichier, mets `data.json` avec :

```json
{ "version": 1, "start": "2026-09-16", "base": 0, "rules": "", "settings_t": 0, "days": {} }
```

(Un `rules` vide est remplacé par le texte par défaut.)

## 4. Le jeton (fine-grained personal access token)

GitHub → photo de profil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.

- **Token name** : `kheper`
- **Expiration** : 1 an (ou « No expiration » si proposé) — note la date, l'app affichera « jeton refusé (401) » le jour où il expire
- **Repository access** : *Only select repositories* → `kheper-data` uniquement
- **Permissions → Repository permissions → Contents : Read and write** (rien d'autre ; *Metadata* passe en lecture automatiquement)

Copie le jeton (`github_pat_…`) : il n'est affiché qu'une fois.

## 5. Dans l'app

Réglages → **Synchronisation GitHub** : compte `Diaks`, dépôt `kheper-data`, colle le jeton, **Enregistrer**. L'indicateur en haut à droite passe à « synchronisé ». Le jeton reste dans le stockage local du téléphone, jamais dans `data.json`.

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
