import { AuthForm } from "./components/auth-form"
import { Suspense, useEffect, useState } from "react"
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
      <main className="container flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-background text-foreground overflow-x-hidden w-full">
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 w-full overflow-hidden">
            <Suspense fallback={<div>Loading...</div>}>
              <ExerciseDashboard user={user} />
            </Suspense>
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
