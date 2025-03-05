import { AuthForm } from "./components/auth-form"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "./lib/supabase"
import "./App.css"
import { ExerciseDashboard } from "./components/exercise-dashboard"
import { Toaster } from "./components/ui/sonner"
import Nav from "./components/nav"
import { ThemeProvider } from "next-themes"
export const App = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Nav user={user} />
      <main className="container flex flex-col items-center justify-center h-screen bg-background text-foreground">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 rounded-xl outline p-4">
              <p className="">
                Hi, <span className="font-bold">{user.email}</span>
              </p>
            </div>
            <ExerciseDashboard />
          </div>
        ) : (
          <AuthForm />
        )}
        <Toaster />
      </main>
    </ThemeProvider>
  )
}

export default App
