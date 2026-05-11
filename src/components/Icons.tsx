interface IconProps {
  className?: string;
}

export const SearchIcon = ({ className }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.354-4.354a8 8 0 1 1l-9 9"/>
    <path d="m21 21-1-1-4.354-4.354a8 8 0 0 1-9-9"/>
  </svg>
);

export const CartIcon = ({ className }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="21" r="1"/>
    <path d="m7 10 2 8"/>
    <path d="M12.48 21.48a1 1 0 0 0 .7-.7"/>
    <path d="m16 13h-2"/>
    <path d="M6 13h2"/>
    <path d="m9 21v-6"/>
  </svg>
);

export const AccountIcon = ({ className }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const SunIcon = ({ className }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4"/>
    <path d="m12 2v2"/>
    <path d="m12 20v2"/>
    <path d="m4.93 4.93 4.93 4.93"/>
    <path d="m19.07 4.93-4.93 4.93"/>
  </svg>
);

export const MoonIcon = ({ className }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1-.93-5.64"/>
    <path d="M12.5 6.5a2.5 2.5 0 0 1 0 0-2.5"/>
    <path d="M22 12c0 1.11-.89 2-2 2"/>
  </svg>
);
