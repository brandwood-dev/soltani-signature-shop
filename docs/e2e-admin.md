# E2E admin authentifié

Les tests CRUD admin modifient des données. Ils ne doivent jamais cibler `www.soltanisignature.com` ou `soltanisignature.com`.

## Secrets GitHub requis

- `E2E_ADMIN_BASE_URL` : URL HTTPS de l’environnement staging ;
- `E2E_ADMIN_API_BASE_URL` : URL de l’API staging correspondante ;
- `E2E_ADMIN_EMAIL` et `E2E_ADMIN_PASSWORD` : compte `SUPER_ADMIN` de test ;
- `E2E_ADMIN_ORDER_ID` : commande fixture staging ;
- `E2E_ADMIN_ORDER_MUTATION` : valeur de statut autorisée pour la fixture.

Le workflow transmet `E2E_ADMIN_ALLOW_WRITES=true` uniquement à cette suite. Le test se désactive si l’URL staging ou les identifiants manquent, et le workflow échoue si l’URL pointe vers la production.

Exécution locale, uniquement contre staging :

```text
E2E_BASE_URL=https://staging.example.com E2E_ADMIN_BASE_URL=https://staging.example.com E2E_API_BASE_URL=https://staging-api.example.com/api/v1 E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... E2E_ADMIN_ALLOW_WRITES=true bun run test:e2e:admin
```
