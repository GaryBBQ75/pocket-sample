# Pocket Sample

Studio de sampling mobile pour navigateur : pads, découpe, séquences, effets et projets locaux.

Version web : https://pocket-sample-gary.gary-legrill.chatgpt.site/

Implémentation indépendante inspirée des fonctions du MPC Sample. Ce projet ne contient ni le firmware, ni les sons usine Akai ; ses algorithmes ne reproduisent pas exactement ceux du matériel. Voir [la couverture fonctionnelle](docs/OPTION-COVERAGE.md) et [les notes de version 13](docs/VERSION-13.md).

## Tester et héberger

Servir `dist/` avec un serveur HTTP pour un essai de base, par exemple `python3 -m http.server 8000 --directory dist`. Utiliser HTTPS pour le micro, Web MIDI et les AudioWorklets ; localhost est également un contexte sécurisé selon le navigateur.

Aucune dépendance JavaScript à installer et aucun service tiers nécessaire au fonctionnement du studio. Les projets et samples personnels sont conservés localement dans le navigateur, pas dans ce dépôt. Exporter régulièrement les projets depuis l'onglet PROJETS.

## Vérifications

```sh
node tests/web-regression.cjs
node tests/performance-dsp.cjs
node tests/worker-dsp.mjs
node tests/effects-worklet.mjs
node tests/stretch-worker.cjs
```

Les scénarios `tests/version13-browser.js` et `tests/version13-io-browser.js` sont des harnais de vérification manuels à inclure uniquement dans une copie de test de la page. Ils remplacent temporairement le projet et restaurent son état ; le second utilise une entrée audio synthétique, sans permission micro.

## Organisation

- `dist/` : application web, DSP WebAssembly précompilé et ressources statiques.
- `native/` : moteur DSP C++ partagé.
- `android/` : laboratoire DSP Android précédent, pas encore le studio web complet.
- `tests/` : régressions fonctionnelles et DSP.
- `docs/` : fonctions, validation et différences avec le matériel.

Le fichier APK disponible dans `dist/` correspond uniquement au laboratoire DSP. Pour modifier le WebAssembly, utiliser Emscripten et `python3 build_web.py --compiler /chemin/vers/em++`.
