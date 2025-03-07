import { User } from "@supabase/supabase-js"
import { ThemeToggle } from "./ui/theme-toggle"
import { supabase } from "@/lib/supabase"

export default function Nav({ user }: { user: User | null }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  return (
    <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center w-full z-10 bg-background/80 backdrop-blur-sm">
      <h1 className="text-2xl font-bold">5ths gym</h1>
      <div className="flex items-center gap-2">
        {user && (
          <>
            <p className="hidden md:block">
              Hi, <span className="font-bold">{user.email}</span>
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-foreground text-background rounded cursor-pointer"
            >
              Log out
            </button>
            <ThemeToggle />
          </>
        )}
      </div>
    </nav>
  )
}
