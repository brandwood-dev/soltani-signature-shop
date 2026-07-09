## Diagnostic

Le problème vient d’une règle globale mobile dans `src/styles.css` :

```css
@media (max-width: 640px) {
  button, a[role="button"], .btn { min-height: 40px; }
}
```

Même si les indicateurs ont `h-[3px]`, cette règle force tous les `<button>` à faire au minimum 40px de hauteur sur mobile. C’est pour ça que les points restent visuellement trop grands / rectangulaires.

## Plan A — recommandé : exclure uniquement les indicateurs de slider

Corriger à la source sans casser les vrais boutons tactiles :

1. Ajouter une classe dédiée aux indicateurs, par exemple `mobile-slider-dot`.
2. L’appliquer aux indicateurs de :
   - Hero
   - Avis clients
   - TrustBar / badges
3. Modifier la règle mobile globale pour garder `min-height: 40px` sur les vrais boutons, mais pas sur `.mobile-slider-dot`.
4. Forcer les indicateurs à rester réellement micro-points :
   - inactif : `3px x 3px`
   - actif : `12px x 3px`
   - `border-radius: 9999px`
   - aucun padding, aucune min-height

Avantage : UX mobile premium, vrais boutons toujours accessibles, desktop inchangé.

## Plan B — masquer complètement les indicateurs sur mobile

1. Cacher les indicateurs Hero, Avis clients et TrustBar uniquement sur mobile.
2. Garder les sliders en auto-play / swipe visuel.
3. Laisser les indicateurs desktop inchangés.

Avantage : rendu mobile très minimaliste.
Inconvénient : l’utilisateur ne voit plus la position dans le slider.

## Plan C — transformer les indicateurs en ligne ultra-fine non cliquable

1. Remplacer les boutons indicateurs mobile par des `<span>` visuels non interactifs.
2. Garder les boutons uniquement desktop.
3. Sur mobile : afficher seulement une jauge fine de progression.

Avantage : aucun conflit avec les styles de boutons.
Inconvénient : perte du clic direct sur un slide mobile.

## Validation prévue

Après implémentation :

1. Vérifier sur viewport mobile `390px` que les indicateurs mesurent réellement `3px` de haut, pas `40px`.
2. Vérifier Hero, Avis clients et TrustBar.
3. Confirmer que les vrais boutons mobile gardent une bonne zone tactile.
4. Confirmer que le desktop reste inchangé.

## Choix recommandé

Implémenter le **Plan A**, car il corrige la cause réelle sans supprimer la navigation et sans modifier le design desktop.