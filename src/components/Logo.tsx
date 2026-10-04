import { Link } from 'wouter';


export function Logo() {
  return (
    <Link href="/" data-testid="link-logo" className="group flex items-center gap-2.5">
      <span className="enrg-logo-mark">
        <img src="/favicon.svg?v=5" alt="ENRG company logo" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        ENRG<span className="text-accent">.</span>
      </span>
    </Link>
  );
}
