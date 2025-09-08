"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { log } from "console"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const validateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Trim and check for empty username
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username can't be empty");
      return;
    }
  
    // Check length
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
  
    if (trimmedUsername.length > 20) {
      setError("Username must be less than 20 characters");
      return;
    }
  
    // Clear previous messages and start loading
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const supabase = createClient();
  
      // Check if username already exists
      const { data: existingUsers, error: fetchError } = await supabase
        .from("participants")
        .select("username")
        .eq("username", trimmedUsername.toLowerCase())
        .limit(1);
      
      console.log(existingUsers,fetchError);
      if (fetchError) throw fetchError;
  
      if (existingUsers.length > 0) {
        setError("This username is already taken. Please choose another one.");
        return;
      }
  
      // Username is available, insert new participant
      const { error: insertError } = await supabase
        .from("participants")
        .insert({ username: trimmedUsername.toLowerCase() });
  
      if (insertError) throw insertError;
  
      setSuccess("Username created successfully!");
  
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/survey?username=${encodeURIComponent(trimmedUsername.toLowerCase())}`);
      }, 1000);
    } catch (error: any) {
      console.error("Username validation error:", error);
      setError("An error occurred while validating your username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">Welcome to the Survey</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your username to begin the assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={validateUsername} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-card-foreground font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">3-20 characters</p>
              </div>

              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/50 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Continue to Survey"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
