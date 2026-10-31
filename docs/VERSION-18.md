# Pocket Sample 18 — remplacement du kit et sauvegarde confirmée

La banque affichée est maintenant la destination proposée par défaut pour un kit. La fenêtre affiche le nom du son actuel sur son premier pad et le son qui va le remplacer : par exemple « A01 / MON ENREGISTREMENT → ELECTRO KICK ». Le choix A–H reste disponible et un remplacement occupé est toujours signalé et annulable.

Après remplacement, le bouton reste désactivé et la fenêtre attend la fin de la transaction IndexedDB. Le statut distingue « enregistré sur cet appareil » de « chargé en mémoire ; sauvegarde locale indisponible, exportez ↓ PROJET ». Un simple délai d’autosave ne suffit plus pour annoncer que le kit est conservé après fermeture.

Les appels concurrents à saveLocal partagent une promesse qui attend les écritures en cours puis le dernier état modifié. Une modification pendant une transaction provoque une nouvelle écriture avant résolution. Une erreur reste signalée et laisse le projet marqué comme non sauvegardé.

Validation : tests des sauvegardes concurrentes, du dernier instantané, de la résolution après commit et de l’erreur de stockage. Test navigateur : son de type prise audio sauvegardé sur A01, remplacement des 16 pads de A par Electro, confirmation de sauvegarde et rechargement de page conservant A01 / ELECTRO KICK. Le test navigateur ne reproduit pas la session privée du téléphone de l’utilisateur ; sa cause exacte initiale n’est pas établie.

La fenêtre de kits attend également la restauration initiale de la session : une lecture IndexedDB lente ne peut plus refermer la fenêtre et annuler le chargement en cours.
