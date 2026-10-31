# Pocket Sample 14 — options et accès mobile

Comparaison refaite le 31 octobre 2026 avec le guide officiel MPC Sample 1.3.0 RevA : https://www.akaipro.com/guides/mpc-sample/index.htm

## Écarts fonctionnels corrigés

- SAMPLE / SEQ sur la grille : déclenchement des sons ou des 128 séquences via huit banques ; passage au jeu de samples à l'armement de REC.
- CHOP sur les pads sans extraction ni écrasement : régions, transitoires, marqueurs manuels, sélection silencieuse, retour au jeu normal. Les tranches peuvent toujours être extraites vers des pads vides.
- Accès direct au clavier chromatique pour jouer un sample en notes et en accords.
- Boucle combinable avec Note On. Le relâchement d'une touche ne coupe plus les autres notes tenues du même sample. Decay From Start coupe également les boucles One Shot à la fin du déclin.
- FULL LEVEL pour les frappes MIDI, et Swing sur Note Repeat, sauf les divisions déjà ternaires.
- Kit Volume indépendant du Master. Fader activable/désactivable, assignable au kit et au Decay/Release automatique selon le mode de lecture.
- Time Correct sur un groupe précis de pads, en conservant les accords. Q partagé avec REC / Note Repeat, sans activer involontairement Note Repeat. Divisions jusqu'à 1/64 et divisions ternaires supplémentaires.
- Effacement de l'automation d'un seul paramètre ; les autres automations sont conservées.
- Bibliothèque temporaire de 256 fichiers/dossier, préécoute manuelle ou automatique, import au pad choisi. Chargement et décodage à la demande ; aucun envoi de fichiers sur un serveur.
- Export d'un kit sans séquences et chargement d'un kit seul en conservant les séquences, le tempo et le morceau. Formats Pocket Sample.
- Nom de projet, plusieurs copies locales indépendantes et import/export de projet. Une copie externe reste nécessaire avant d'effacer les données du navigateur.
- Éditeur de liste Song : insertion, retrait, déplacement et lecture à partir de la ligne sélectionnée. Sélection du pad vide cible pour rendre une séquence.
- Choix du port MIDI d'entrée et interrupteur Pad MIDI In. MIDI Clock et MTC exclusifs dans chaque direction.
- MTC Quarter Frame en marche avant : entrée avec alignement de séquence et arrêt sur perte du signal ; sortie en 24, 25, 29,97 drop-frame ou 30 fps. Pas de Full Frame SysEx ni de suivi arrière. Matériel réel non testé et pas de verrouillage sample-exact.
- STOP désarme REC ; un relâchement Note On pendant la préparation Warp empêche tout déclenchement tardif.
- Normalisation à 0 dB de la seule région sélectionnée, sans modifier le reste du sample.
- Résonance de Beat Repeat ajoutée au traitement live et au rendu offline.

## Vérification

Régressions fonctionnelles V13/V14 et tests MTC dédiés. Références timecode à zéro, une heure et dix minutes drop-frame, labels invalides, sorties horodatées. Tests navigateur : CHOP conserve les sons, grille SEQ, préécoute et import WAV, kit seul, liste Song, sauvegarde/restauration locale. Tests DSP existants inchangés et repassés. Rendu navigateur des 31 familles et 16 Pad FX revérifié.

## Différences restantes avec le matériel

L'application n'est pas une émulation du firmware et n'est pas affiliée à Akai. Les algorithmes d'effets, enveloppes et filtres sont indépendants : mêmes familles fonctionnelles ne signifie pas même rendu sonore ni mêmes courbes. LoFi utilise une réduction de bande et une quantification ; ce n'est pas un décimateur identique à celui du matériel. Les motifs Flex Beat sont indépendants.

Les sons usine et les formats de projets Akai ne sont pas inclus. Le navigateur ne reproduit pas les connecteurs CV/Sync, le montage USB de la carte SD ni les réglages physiques de reprise des potentiomètres. Les entrées audio et MIDI disponibles dépendent du navigateur et du matériel connecté. Le monitoring micro fonctionne seulement tant que l'entrée est explicitement armée.

MTC reste limité aux Quarter Frames en marche avant et à la séquence active. MIDI Clock et MTC ne sont pas des synchronisations garanties à l'échantillon près. L'audio réel Android, les contrôleurs physiques et les limites de mémoire sur appareil restent à éprouver. L'APK est encore le laboratoire DSP, pas le studio complet. Le nombre de signatures, la mémoire et la durée de rendu restent limités comme précisé dans la couverture. Un changement de tempo en lecture peut nécessiter un arrêt/relancement pour préparer le nouveau Warp. Le mode CHOP joue les régions pour l'audition ; pour séquencer chaque région comme un son indépendant, utiliser EXTRAIRE ou RÉPARTIR.

Ces limites empêchent encore de présenter la version comme une équivalence intégrale du MPC Sample.
