# Pocket Sample 15 — CHOP enregistré, Warp en lecture, LoFi et MTC

- Le jeu en CHOP s’enregistre directement avec REC, et dans Sequence Recall. Plusieurs tranches au même pas restent distinctes. Les bornes sont sauvegardées dans chaque note ; déplacer les marqueurs ensuite ne change pas les notes déjà enregistrées. Lecture et export utilisent ces mêmes bornes.
- Le nouveau tempo Warp est préparé hors thread audio, puis appliqué à la prochaine mesure. Une demande plus récente remplace la précédente. Les boucles actives reprennent à la même phase avec un fondu de 5 ms et conservent leur note et leur touche. Le cache reste plafonné à 48 Mo ; les rendus nécessaires à la lecture sont protégés de l’éviction. Si les deux tempos ne tiennent pas en mémoire, le changement est refusé et l’ancien tempo conservé. Une demande annulée ne peut plus s’appliquer après STOP ou changement de projet.
- LoFi : vraie décimation par maintien d’échantillon (1–128 samples) et quantification 2–24 bits, stéréo, AudioWorklet en lecture et à l’export. Aucun ScriptProcessor. Le bouton **? → VÉRIFIER L’AUDIO** vérifie le résultat hors ligne, sans accès micro/MIDI. HTTPS et navigateur compatible nécessaires.
- 48 signatures : 1–16 sur 4, 8 ou 16. Jusqu’à 64 pas par mesure et 8192 pas dans les 128 mesures ; import/export et automation adaptés.
- MTC : Full Frame Locate en entrée sans lancement automatique, position initiale en sortie avec SysEx autorisé ; Quarter Frames en entrée avant/arrière. En arrière, l’ordre de lecture des notes suit le timecode, les samples restent lus dans leur sens propre. Sortie Quarter Frame en avant. La connexion SysEx reste un bouton explicite distinct du MIDI ordinaire.
- STOP pendant la préparation de PLAY annule maintenant également ce lancement tardif.

## Vérification

Régressions Web, WSOLA, DSP temporel, worker WAV et worklet WASM. Tests dédiés LoFi (valeurs exactes, stéréo, continuité entre blocs), Warp (dernier tempo, application différée, phase de boucle, annulation), MTC (4 cadences, drop-frame, Full Frame et ordre inverse), CHOP et sauvegarde des bornes, dernier pas 8191 en 16/4. Navigateur : CHOP REC, sauvegarde, rendu de tranche, signature 64 pas, préparation et application du tempo Warp sur une boucle réelle. Vérification HTTPS du vrai rendu LoFi stéréo et export réussie. Contrôle mobile à 375 px sans débordement horizontal en PADS et CHOP. Signature initiale 4/4 explicitement sélectionnée pour une première ouverture sans session.

## Limites maintenues

Ce studio reste une implémentation indépendante, sans firmware, banques usine ni formats de projets Akai. Les algorithmes d’effets ne garantissent pas un son identique au matériel. Pas de CV/Sync ni montage SD. MTC suit uniquement la séquence active ; aucune garantie de synchronisation à l’échantillon près. Les essais sur téléphone physique, entrée audio réelle et contrôleur MIDI restent nécessaires. Le studio complet est web ; l’APK présent est le laboratoire DSP antérieur.

Pour préserver la mémoire mobile, les samples restent limités à 60 s, le projet à 240 s équivalentes mono et le rendu WAV à 60 s. Les changements de tempo Warp sont quantifiés à la mesure après préparation ; ce n’est pas une déformation continue de type scratch. L’automation de séquence reste à la double-croche, avec déclenchements de notes à 96 PPQN.
