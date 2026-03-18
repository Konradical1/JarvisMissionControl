'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'Tasks'],
  ['/agents', 'Agents'],
  ['/memory', 'Memory'],
  ['/docs', 'Docs'],
  ['/settings', 'Settings']
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        Jarvis Mission Control
        <small>Linear-style command center for Jarvis, OpenClaw, and your workspace.</small>
      </div>
      <nav className="nav">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
