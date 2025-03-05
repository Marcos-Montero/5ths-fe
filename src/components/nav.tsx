import { User } from "@supabase/supabase-js"
import { ThemeToggle } from "./ui/theme-toggle"
import { supabase } from "@/lib/supabase"

export default function Nav({ user }: { user: User | null }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  return (
    <nav className="flex justify-between items-center w-full">
      <h1 className="text-2xl font-bold">5ths gym</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Log out
          </button>
        )}
      </div>
    </nav>
  )
}
