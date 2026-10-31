# Pocket Sample 16 — jeu mobile et portée des effets

- Les relâchements Pointer Up / Cancel / Lost Capture sont idempotents. Un second événement ne peut plus relâcher un pad d’une autre banque. Une voix Note On garde son mode de maintien initial même si le réglage du pad change pendant la note.
- Plusieurs doigts peuvent maintenir le même Pad FX : l’effet reste engagé jusqu’au dernier relâchement. Le comportement Latch est mémorisé à l’appui, et les relâchements dupliqués sont ignorés.
- La perte de focus relâche les touches et les effets maintenus. Passer en arrière-plan arrête aussi les voix jouées sans séquence, pour éviter leur reprise après suspension audio.
- En vue PADS sur mobile, changer de pad rafraîchit uniquement la sélection, les commandes de mute/solo, la piste visible et le résumé des effets. La forme d’onde, le piano roll, les paramètres avancés et la liste des 128 sons ne sont plus reconstruits pendant cette frappe. L’ouverture de l’éditeur effectue un rafraîchissement complet. Le son reste déclenché avant le rafraîchissement d’écran.
- Résumé des effets accessible depuis les pads : effet individuel du son sélectionné, cible du rack (tous / pad précis / groupe) et effets globaux. Un trait jaune indique les pads ciblés par un rack actif. Les paramètres individuels sont accessibles directement depuis ce résumé. Le rack garde sa cible quand on joue un autre pad ; elle est affichée explicitement.
- Le diagnostic audio affiche les informations de délai communiquées par le navigateur, distingue une estimation complète d’une valeur partielle ou absente, et précise qu’il ne mesure pas le temps entre le doigt et le son. Conseil de casque filaire plutôt que Bluetooth.

## Validation

Régressions des voix, relâchement dupliqué avec changement de banque, modification de mode pendant une note, maintien simultané d’un même effet, Latch, portée du rack et présentation des délais. Tests navigateur dans une iframe mobile : deux voix créées avant résolution des promesses, rafraîchissement compact sans appel au rendu complet, sélection cohérente, relâchements indépendants et sur perte de focus, éditeur à jour, texte des cibles et marquage des pads. Régressions MTC, Warp et LoFi repassées.

Ces essais ne remplacent pas les mesures sur téléphone physique, le vrai multitouch du système, le Bluetooth ou les entrées/sorties MIDI physiques. Aucune promesse chiffrée de baisse de latence matérielle. Aucune nouvelle dépendance ni service externe ; projets et samples restent locaux. Les limites mémoire et les différences avec les formats, le contenu et le DSP Akai restent celles de la version 15.
