import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';

export default function AdminLayout({ children }) {
  if (!isAdmin()) redirect('/login');
  return (
    <div className="container-x py-6 lg:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6 lg:gap-8">
        <aside className="lg:sticky lg:top-24 h-fit">
          <h2 className="font-display text-2xl font-semibold text-navy-900 mb-3 hidden lg:block">Admin</h2>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 text-sm border-b lg:border-b-0 border-navy-100">
            <Link href="/admin" className="flex-shrink-0 px-3 py-2 rounded hover:bg-navy-50 text-navy-700 whitespace-nowrap">Dashboard</Link>
            <Link href="/admin/properties" className="flex-shrink-0 px-3 py-2 rounded hover:bg-navy-50 text-navy-700 whitespace-nowrap">Properties</Link>
            <Link href="/admin/properties/new" className="flex-shrink-0 px-3 py-2 rounded hover:bg-navy-50 text-navy-700 whitespace-nowrap">Add property</Link>
            <Link href="/admin/enquiries" className="flex-shrink-0 px-3 py-2 rounded hover:bg-navy-50 text-navy-700 whitespace-nowrap">Enquiries</Link>
            <Link href="/admin/settings" className="flex-shrink-0 px-3 py-2 rounded hover:bg-navy-50 text-navy-700 whitespace-nowrap">Settings</Link>
            <form action="/api/auth/logout" method="POST" className="lg:pt-4 ml-auto lg:ml-0 flex-shrink-0">
              <button className="px-3 py-2 text-sm text-red-600 hover:underline whitespace-nowrap">Sign out</button>
            </form>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
