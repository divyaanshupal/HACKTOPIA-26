import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, isAdmin = false, showSidebar = true }) {
  return (
    <div className="relative min-h-screen flex">

      {/* Background Image */}
      <div
        className="
          fixed inset-0
          bg-[url('/assets/img/banner.png')]
           bg-repeat bg-cover blur-xs
        "
      />

      {/* Overlay for softness */}
      <div className="fixed inset-0 bg-slate/40" />

      {/* App Content */}
      <div className="relative z-10 flex w-full p-4">
        {/* Fixed Sidebar */}
        {showSidebar && (
          <div className="flex-shrink-0">
            <Sidebar isAdmin={isAdmin} />
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 relative min-h-screen overflow-y-auto">
          <Header />
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
