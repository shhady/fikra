import '../globals.css';

export const metadata = {
  title: 'FikraNova Admin',
  description: 'Private administration area.',
  // Keep the admin area out of search engines entirely.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

/**
 * Root layout for /admin.
 *
 * This project has no shared root layout — each top-level section ([lang],
 * jomana, coconails) supplies its own <html>/<body>. /admin follows that
 * pattern, which also keeps the marketing site's locale chrome out of here.
 */
export default function AdminLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
