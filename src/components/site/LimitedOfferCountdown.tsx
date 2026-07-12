import { useState } from "react";
import { CountdownInline } from "./Countdown";

type Props = {
  endsAt?: string | null;
  className?: string;
  onExpire?: () => void;
};

export function useLimitedOfferTarget(endsAt?: string | null) {
  const target = endsAt ? new Date(endsAt).getTime() : 0;
  return Number.isFinite(target) ? target : 0;
}

export function LimitedOfferCountdown({ endsAt, className, onExpire }: Props) {
  const target = useLimitedOfferTarget(endsAt);
  const [expired, setExpired] = useState(() => !target || target <= Date.now());

  if (expired) return null;

  return (
    <CountdownInline
      target={target}
      className={className}
      onExpire={() => {
        setExpired(true);
        onExpire?.();
      }}
    />
  );
}
