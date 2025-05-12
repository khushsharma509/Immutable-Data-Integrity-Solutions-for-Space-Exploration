// frontend/app/layout.js (update your existing layout)
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <nav className="main-nav">
            <div className="logo">IPFS + Blockchain Storage</div>
            <ul className="nav-links">
              <li><a href="/encrypt">Encrypt & Upload</a></li>
              <li><a href="/decrypt">Retrieve & Decrypt</a></li>
            </ul>
          </nav>
        </header>
        <main className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} - Secure IPFS Storage with Blockchain Verification</p>
        </footer>
      </body>
    </html>
  );
}
