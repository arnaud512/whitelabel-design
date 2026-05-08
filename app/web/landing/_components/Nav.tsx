export function Nav() {
  return (
    <nav className="flex items-center justify-between px-m py-s @md:px-l">
      <span className="font-display text-h3 font-semibold text-foreground">
        whitelabel
      </span>
      <div className="hidden items-center gap-l @md:flex">
        <a className="text-body-regular text-muted-foreground hover:text-foreground" href="#features">
          Features
        </a>
        <a className="text-body-regular text-muted-foreground hover:text-foreground" href="#pricing">
          Pricing
        </a>
        <a className="text-body-regular text-muted-foreground hover:text-foreground" href="#about">
          About
        </a>
      </div>
      <a
        href="#"
        className="rounded-full bg-primary px-m py-xs text-body-regular font-medium text-primary-foreground"
      >
        Sign in
      </a>
    </nav>
  );
}
