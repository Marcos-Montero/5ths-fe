import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const AuthForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  const handleSubmit = async (mode: "login" | "register") => {
    setLoading(true)
    setError(null)

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (mode === "register") {
      setIsRegistered(true)
    }
    setLoading(false)
  }

  if (isRegistered) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Registration Successful</CardTitle>
          <CardDescription>
            You've received a confirmation email. Please check your inbox to
            verify your account.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="login" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="login"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white bg-white"
        >
          Login
        </TabsTrigger>
        <TabsTrigger
          value="register"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white bg-white"
        >
          Register
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Welcome back! Please enter your credentials to access your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email-login">Email</Label>
              <Input
                id="email-login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-login">Password</Label>
              <Input
                id="password-login"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSubmit("login")} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Create a new account to start using 5ths gym.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email-register">Email</Label>
              <Input
                id="email-register"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-register">Password</Label>
              <Input
                id="password-register"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSubmit("register")} disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
