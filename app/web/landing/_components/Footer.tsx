export function Footer() {
  return (
    <footer className="border-t border-border px-m py-l @md:px-l">
      <div className="flex flex-col gap-l @md:flex-row @md:items-center @md:justify-between">
        <div className="flex flex-col gap-xxs">
          <span className="font-display text-h3 font-semibold text-foreground">
            whitelabel
          </span>
          <p className="text-body-label text-muted-foreground">
            © 2026 Your Company · All rights reserved
          </p>
        </div>
        <div className="flex flex-wrap gap-l text-body-regular text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
          <a href="#" className="hover:text-foreground">Status</a>
        </div>
      </div>
    </footer>
  );
}
