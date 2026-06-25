# Vulnérabilités undici (transitif via @tanstack/react-start)

## Contexte

L'avis concerne **undici**, importé de manière transitive par `@tanstack/react-start@1.167.50`. Ce n'est pas une dépendance directe du projet — on ne peut pas la mettre à jour sans qu'une version corrigée de `@tanstack/react-start` la référence.

Les trois CVE listées :

- **GHSA-vmh5-mc38-953g** — bypass de validation TLS via `SOCKS5 ProxyAgent`.
- **GHSA-vxpw-j846-p89q** — DoS du client WebSocket via fragmentation.
- **GHSA-hm92-r4w5-c3mj** — réutilisation de pool SOCKS5 entre origines.

Les trois scénarios exigent : usage du **client HTTP undici** côté serveur, derrière un **proxy SOCKS5** ou via un **client WebSocket sortant**. Le projet LaMode.tn :

- N'utilise pas undici directement (aucun `import undici`).
- N'utilise pas de proxy SOCKS5.
- N'utilise pas de client WebSocket sortant côté serveur.
- Cible Cloudflare Workers, où undici n'est même pas le client HTTP runtime utilisé en production (le runtime fournit `fetch` natif).

→ Risque effectif **nul** dans le contexte d'exécution actuel.

## Plan d'action

1. **Vérifier qu'il n'existe pas de version corrigée immédiatement disponible** de `@tanstack/react-start` qui bumpe undici. Si oui : `bun update @tanstack/react-start` puis re-scan. Sinon, passer à l'étape 2.
2. **Marquer le finding comme `ignore`** via `security--manage_security_finding` avec l'explication ci-dessus (transitif, vecteurs d'attaque non utilisés, runtime Workers).
3. **Mettre à jour `security--update_memory`** pour ajouter une note : « Les vulnérabilités undici transitives via @tanstack/react-start sont ignorées tant que (a) le projet n'introduit pas de proxy SOCKS5 ou de client WebSocket sortant côté serveur, et (b) il n'existe pas de version corrigée de @tanstack/react-start. À ré-évaluer si l'une de ces conditions change. »
4. **Aucun changement de code applicatif** n'est nécessaire.

## Hors-scope

- Pas de patch manuel d'undici via `resolutions` / `overrides` : Lovable gère le lockfile, et forcer une version peut casser la compat runtime de `@tanstack/react-start`.
- Le travail en cours sur les filtres par catégorie (PDF) reste prioritaire et sera repris ensuite.
