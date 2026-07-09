export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default px-4 py-4 md:px-6">
      <p className="text-center text-xs text-text-muted">
        © {year} Repack · AI destekli içerik dönüştürme
      </p>
    </footer>
  );
}
