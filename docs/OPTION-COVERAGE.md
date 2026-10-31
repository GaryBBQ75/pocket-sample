# Couverture MPC Sample — Pocket Sample 17

Audit du manuel MPC Sample User Guide v1.3.0 RevA, pages 24–63, téléchargé le 30 octobre 2026 depuis le CDN officiel inMusic. Relecture web complète le 31 octobre 2026 ; détails actuels dans VERSION-17.md. Statuts fonctionnels, pas une preuve d’équivalence sonore. Les fonctions sont évaluées comme implémentations indépendantes. Les restrictions de plateforme et les différences de moteur restent explicites.

| Fonction | État | Portée / écart |
|---|---|---|
| Trim / zoom / loop point | Présent | Bornes, zoom, vue stéréo, point de boucle et Loop Lock. |
| Volume / pan / tuning | Présent | Volume du pad jusqu’à +6 dB environ, pan, demi-tons et cents. |
| Amp / filter envelope | Adapté | Attaque, déclin depuis début/fin, relâchement, profondeur filtre ; courbes indépendantes. |
| Polyphony / Mute Group / Pad Link / Offset | Présent | Mono/poly, 16 groupes d’exclusion, liaison dans la banque, décalage en millisecondes. |
| Types de filtre Classic / 2 / 4 pôles | Adapté | LP/HP/BP à 2 ou 4 pôles, Classic coloré, notch et résonance. Courbes indépendantes, pas un modèle MPC3000 validé. |
| Warp | Adapté | Off / pourcentage / suivi du tempo, avec ou sans conservation de la hauteur. Original intact ; cache préparé hors thread audio, 48 Mo, 80 ms minimum pour WSOLA, sortie 60 s maximum. Changement de séquence préparé avant lancement ; en lecture, préparation du nouveau tempo puis application à la prochaine mesure et fondu de 5 ms des boucles avec conservation de leur phase. Deux rendus doivent tenir dans les 48 Mo ; sinon le tempo précédent est conservé. |
| Chop régions / transitoires / manuel | Adapté | Mode CHOP sur la grille sans écrasement, marqueurs manuels, régions/transitoires, split/merge, extraction et répartition. REC et Sequence Recall enregistrent directement les tranches ; leurs bornes sont conservées dans les notes, même après déplacement des marqueurs. |
| Note On / Loop / Reverse / Mute / 16 Levels | Présent | Arrêt immédiat distinct du mute, mode Mute par grille, solo exclusif en haut, Note On combinable avec Loop, relâchement indépendant des notes, FULL LEVEL et variations de vélocité/filtre/tune. |
| Sample browser / save | Adapté | Sélection de 256 fichiers ou dossier, préécoute manuelle/automatique et sauvegarde WAV ; fichiers chargés à la demande. Banque initiale de 64 sons synthétiques originaux en quatre kits, chargés à la demande ; pas de bibliothèque usine Akai. |
| Enregistrement micro / entrées | Adapté | Choix des entrées exposées, stéréo/L/R, durée libre ou séquence, seuil, monitor Off/Auto/On, inclusion du rack, marqueurs pendant la prise. Durée 59 s maximum et synchronisation MediaRecorder non sample-exacte. |
| Sample Recall | Adapté | 25 dernières secondes d’une entrée explicitement armée. Se désarme en arrière-plan. |
| Séquences 1–128 mesures | Présent | 128 emplacements, longueur indépendante, copie, double/half, Continue. |
| Tempo global / par séquence / signature | Adapté | Kit Volume indépendant du Master. Tempos indépendants ; 48 signatures : numérateur 1–16, dénominateur 4, 8 ou 16 ; jusqu’à 64 pas/mesure et 8192 pas/séquence. |
| Record / overdub / Sequence Recall | Adapté | Jusqu’à 32 notes par pad/pas, position à 96 PPQN, durée et hauteur indépendantes. Recall conserve le dernier cycle joué. |
| Automation | Adapté | Volume, pan, tune/fine, amp attack/decay/release, filtre/enveloppe, sensibilité vélocité et offset. Effacement par paramètre. Points de séquence à la double-croche ; volume/pan/hauteur/filtre répondent aussi immédiatement en direct. |
| Step Edit / Time Correct | Adapté | Sélection de chaque note, vélocité, hauteur, durée et décalage ; piano roll, copier/coller, inversion, legato, transposition. Recalage temporel et accords conservés, Time Correct sur un groupe précis de pads et Q partagé REC/Repeat ; limite 32 notes par cellule. |
| Half/Double Sequence / Speed | Présent | Longueur avec copie ou placement des notes. Distinct de la vitesse audio du sample. |
| Song / audio mixdown / Song → Sequence | Adapté | Liste de 64 séquences : insérer/retirer/déplacer, Continue depuis une ligne, boucles, fusion jusqu’à 128 mesures et rendu vers pad. WAV limité à 60 s. |
| Pad FX original : 16 effets, 4 simultanés, pression, latch | Adapté | 16 familles, 4 actives avec priorité et réactivation des précédentes, maintien/Latch, pression du stylet si disponible. Moteurs et paramètres sont des interprétations indépendantes. |
| Flex Beat | Adapté | 16 motifs temporels indépendants, one-shot/loop, mélange et déclenchement quantifié. Presets Akai non reproduits. |
| Knob FX | Adapté | Catalogue avancé des familles du manuel (delay/diff/tape/sample, réverbérations, dynamique, filtres, distorsions, modulations, émulations) plus Chorus, LoFi et Comb. Paramètres détaillés conservés. LoFi possède une vraie décimation sample-and-hold et quantification, en stéréo, en lecture comme à l’export. Algorithmes indépendants et certaines courbes/dynamiques approximées. |
| Compresseur dédié | Adapté | Attaque, release, amount, boost et coloration ; son indépendant. |
| Fader | Présent | Activable, volume pad/kit/master, pan, tune, attaque, Decay/Release automatique et cutoff. Contrôle tactile direct. |
| MIDI notes / channels / program / thru | Adapté | Choix du port d’entrée/sortie Web MIDI, Pad In On/Off, canaux, pads vides seulement et Program Change ; matériel non testé. |
| MIDI Clock | Partiel | 24 PPQN en sortie ; suivi du tempo + Start/Continue/Stop en entrée. Pas de verrouillage de phase sample-exact. |
| MTC | Partiel | Quarter Frame entrée avant/arrière (ordre des notes, sans inverser les samples), sortie avant ; Full Frame Locate entrée et position initiale en sortie avec connexion SysEx explicite. 24/25/29,97 DF/30 fps, séquence active seulement, matériel non testé. |
| CV Sync / hardware Takeover | Non disponible | Connecteur CV/Sync et commandes physiques non reproduits. Les curseurs tactiles suivent directement les paramètres. |
| Project / autosave / undo-redo | Présent | Projets nommés, plusieurs copies locales, import/export et kit seul sans séquences. Format indépendant, pas du format Akai. |
| SD Card Access / factory content / firmware | Non disponible | Transfert via fichiers du navigateur. Aucune émulation du firmware, de la carte SD ou du contenu usine. |
| Application native Android / iOS complète | Absente | Le studio fonctionne sur le web. L’APK proposé reste le laboratoire DSP précédent. |
