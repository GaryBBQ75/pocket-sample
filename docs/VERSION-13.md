# Pocket Sample 13

## Fonctions ajoutées

- Boutons permanents ARRÊTER CE PAD, RENDRE MUET, ISOLER CE PAD / QUITTER SOLO et MODE MUTE. L'arrêt coupe les voix actuelles ; le mute empêche aussi les prochains déclenchements. Le solo exclusif isole le pad sélectionné et coupe les autres voix ainsi que les mémoires d'effets partagés.
- Déclenchement des pads avant le rafraîchissement visuel. Aucun await sur un contexte audio actif et un sample préparé. Bouton ACTIVER AUDIO pour préparer le moteur et la banque en cours. Indication de latence de sortie déclarée par le navigateur, sans prétendre mesurer la latence réelle au toucher.
- Notes polyphoniques, jusqu'à 32 notes par pad et cellule, position à 96 PPQN, vélocité/hauteur/durée distinctes. Piano roll, copier/coller une mesure, inversion temporelle, legato, transposition et clavier à neuf gammes.
- 31 familles d'effets avancés avec paramètres détaillés, utilisables dans le rack commun ou sur un pad. Algorithmes indépendants de ceux d'Akai.
- 16 Pad FX de performance, quatre simultanés selon la priorité des derniers activés, maintien ou Latch, pression de stylet si disponible. Les quatre processeurs temporels sont créés seulement à l'utilisation. Les gestes ne sont pas enregistrés comme automation ; la capture audio live les inclut.
- Entrée audio avancée : périphérique exposé au navigateur, stéréo/gauche/droite, seuil, monitoring Off/Auto/On, durée libre ou séquence et marqueurs pendant la prise. Durée maximum 59 secondes. L'entrée se ferme en arrière-plan.
- Warp non destructif par pourcentage ou durée musicale, avec conservation de la hauteur ou vitesse liée à la hauteur. Préparation par worker et cache limité à 48 Mo. Les séquences demandées en lecture attendent leur préparation ; une demande obsolète ne peut plus changer la séquence.
- Format de projet version 9 ; lecture des versions antérieures conservée.

## Vérification effectuée

- Régressions fonctionnelles : stéréo, découpe/undo, banques, séquences 128 mesures, signatures, export de projet, notes polyphoniques, gate, solo/mute, MIDI simulé et requêtes de séquence asynchrones.
- DSP : 16 motifs temporels, historique stéréo, worker WAV, WebAssembly/AudioWorklet, étirement 0,5–2 avec contrôle de hauteur.
- Navigateur Chrome : 31 familles d'effets et 16 Pad FX produisent un signal fini et modifié ; trois notes distinctes dans une cellule sont rendues.
- Entrée synthétique navigateur : enregistrement stéréo sur seuil et Warp 150 % / durée musicale ; sample original préservé. Aucun microphone réel n'a été utilisé pour cette vérification.

## Limites conservées

Ce n'est pas une émulation du firmware Akai. Les formats de projets propriétaires, le contenu usine, les connexions CV/MTC et l'accès matériel SD ne sont pas reproduits. MIDI physique et latence Android au toucher restent à vérifier sur appareil réel. La synchronisation de prise MediaRecorder et MIDI Clock n'est pas sample-exacte. Une modification du tempo pendant la lecture peut nécessiter la préparation d'un nouveau Warp ; arrêter puis relancer prépare les rendus au nouveau tempo. Les variantes d'effets, enveloppes et filtres sont des interprétations indépendantes. Export mix limité à 60 secondes et mémoire audio volontairement bornée pour mobile. L'APK fourni reste le laboratoire DSP, pas l'application complète.
