import Link from 'next/link';

export default function Navbar({ onPostGig, onPostDemand, onLogOut, user }) {
  return (
    <nav className="border-b border-gray-800 bg-[#111111] py-4">
      <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-medium text-white">
            Rizq Marketplace
          </Link>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={onPostGig}
              className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
            >
              Post a Gig
            </button>
            <button
              onClick={onPostDemand}
              className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
            >
              Post a Demand
            </button>
            <Link 
              href="/profile" 
              className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
            >
              Profile
            </Link>
            <button
              onClick={onLogOut}
              className="text-white text-sm px-4 py-1.5 rounded transition-colors hover:bg-gray-800"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 