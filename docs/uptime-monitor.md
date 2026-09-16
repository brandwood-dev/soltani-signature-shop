# Monitoring de disponibilité

Le workflow `.github/workflows/uptime-monitor.yml` vérifie toutes les cinq minutes, depuis GitHub Actions et indépendamment de Render :

- le frontend `https://www.soltanisignature.com/` avec une réponse HTTP 2xx et la présence de `Soltani` ;
- l’API `https://soltani-signature-api.onrender.com/api/v1/health/ready` avec `status: ok` et `database: ok`.

Une alerte est envoyée à `meds.rayan@gmail.com` uniquement lors du passage à l’état indisponible. Un e-mail de rétablissement est envoyé lors du retour à l’état disponible. L’état est conservé dans la variable d’Actions `SOLTANI_UPTIME_STATE` afin d’éviter les e-mails répétés.

## Configuration requise

Ajouter dans `Settings → Secrets and variables → Actions → Secrets` du dépôt `brandwood-dev/soltani-signature-shop` :

- `UPTIME_BREVO_API_KEY` : clé API Brevo permettant l’envoi transactionnel depuis `notifications@soltanisignature.com`.

La clé est utilisée uniquement par GitHub Actions et n’est jamais écrite dans le dépôt, les logs ou les URLs. Le destinataire est fixé dans le workflow à `meds.rayan@gmail.com`.

Le premier lancement manuel doit être effectué après l’ajout du secret. Il crée automatiquement la variable d’état `SOLTANI_UPTIME_STATE` avec les permissions Actions du workflow.

## Limites

La planification GitHub Actions peut subir quelques minutes de retard. Ce mécanisme réduit le délai de détection mais ne remplace pas une garantie de disponibilité du fournisseur d’hébergement.
