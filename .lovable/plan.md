# Supprimer le badge « Edit with Lovable »

Le badge « Edit with Lovable » est injecté automatiquement par Lovable sur toutes les versions publiées (y compris votre domaine personnalisé `soltanisignature.com`). Il ne fait pas partie du code du projet — impossible donc de le retirer en modifiant un fichier. Il se désactive via un réglage de publication.

## Ce que je vais faire

1. Basculer le réglage de visibilité du badge sur « masqué » via l'outil `set_badge_visibility` (`hide_badge: true`).
2. Republier le site pour que le changement soit visible en production sur `www.soltanisignature.com`.

## Prérequis important

Masquer le badge nécessite un **plan Pro ou supérieur** sur Lovable. Si votre espace de travail est sur le plan gratuit, l'appel échouera et il faudra d'abord passer à un plan Pro depuis les paramètres de facturation.

## Après application

- Le badge disparaîtra du site publié (Lovable URL + domaine personnalisé) dès que la nouvelle version sera déployée (~1 minute).
- Le badge restera visible dans l'éditeur / la preview — c'est normal, il ne concerne que les déploiements publics.
- Réversible à tout moment (`hide_badge: false`).
