import { useEffect, useState } from "react";

import {
  readMetaEnhancedMatchingConsentState,
  setMetaEnhancedMatchingConsent,
  type MetaEnhancedMatchingConsentState,
} from "@/lib/meta-pixel";

export function MetaMatchingConsentBanner() {
  const [consentState, setConsentState] = useState<MetaEnhancedMatchingConsentState>("unset");

  useEffect(() => {
    setConsentState(readMetaEnhancedMatchingConsentState());
  }, []);

  if (consentState !== "unset") return null;

  const chooseConsent = (accepted: boolean) => {
    setMetaEnhancedMatchingConsent(accepted);
    setConsentState(accepted ? "accepted" : "refused");
  };

  return (
    <aside
      aria-labelledby="meta-matching-consent-title"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-2xl rounded-sm border border-border bg-background p-4 shadow-2xl sm:bottom-5 sm:p-5"
      role="dialog"
    >
      <h2 id="meta-matching-consent-title" className="font-display text-base font-semibold text-foreground">
        Améliorer la mesure de nos campagnes
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Avec votre accord, votre email, votre téléphone et un identifiant technique peuvent être transmis à Meta
        uniquement sous forme hachée pour mesurer les campagnes et améliorer leur attribution.
      </p>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => chooseConsent(false)}
          className="inline-flex min-h-10 items-center justify-center rounded-sm border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => chooseConsent(true)}
          className="inline-flex min-h-10 items-center justify-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Accepter
        </button>
      </div>
    </aside>
  );
}
