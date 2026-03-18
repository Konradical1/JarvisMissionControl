import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Jarvis Mission Control',
  description: 'Mission control dashboard for Jarvis and OpenClaw.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
