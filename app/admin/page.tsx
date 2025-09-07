"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Users, Trophy, TrendingUp, Eye, Calendar, BarChart3 } from "lucide-react"
import { format } from "date-fns"

interface SurveyResponse {
  id: string
  username: string
  answers: Record<string, string>
  total_score: number
  max_possible_score: number
  percentage_score: number
  result_category: string
  completed_at: string
}

interface Statistics {
  totalParticipants: number
  averageScore: number
  passRate: number
  categoryBreakdown: Record<string, number>
}

export default function AdminPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch all survey responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("survey_responses")
        .select("*")
        .order("completed_at", { ascending: false })

      if (responsesError) {
        throw responsesError
      }

      setResponses(responsesData || [])

      // Calculate statistics
      if (responsesData && responsesData.length > 0) {
        const totalParticipants = responsesData.length
        const averageScore =
          responsesData.reduce((sum, response) => sum + response.percentage_score, 0) / totalParticipants
        const passCount = responsesData.filter((response) => response.percentage_score >= 60).length
        const passRate = (passCount / totalParticipants) * 100

        const categoryBreakdown: Record<string, number> = {}
        responsesData.forEach((response) => {
          categoryBreakdown[response.result_category] = (categoryBreakdown[response.result_category] || 0) + 1
        })

        setStatistics({
          totalParticipants,
          averageScore: Math.round(averageScore * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
          categoryBreakdown,
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch admin data:", error)
      setError("Failed to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const formatAnswers = (answers: Record<string, string>) => {
    return Object.entries(answers)
      .map(([questionId, answerId]) => `${questionId.toUpperCase()}: ${answerId.toUpperCase()}`)
      .join(", ")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Survey results and analytics</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalParticipants}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.passRate}%</div>
                <p className="text-xs text-muted-foreground">60% or higher</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(statistics.categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Survey Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No survey responses yet</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">{response.username}</TableCell>
                        <TableCell>
                          {response.total_score}/{response.max_possible_score}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getScoreColor(response.percentage_score)}`}>
                            {response.percentage_score}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(response.result_category)}>
                            {response.result_category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              response.percentage_score >= 60
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {response.percentage_score >= 60 ? "PASS" : "FAIL"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(response.completed_at), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedResponse(response)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Survey Details - {selectedResponse?.username}</DialogTitle>
                              </DialogHeader>
                              {selectedResponse && (
                                <ScrollArea className="max-h-96">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Score</p>
                                        <p className="text-lg font-bold">
                                          {selectedResponse.total_score}/{selectedResponse.max_possible_score} (
                                          {selectedResponse.percentage_score}%)
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                                        <Badge className={getCategoryColor(selectedResponse.result_category)}>
                                          {selectedResponse.result_category}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">Answers</p>
                                      <p className="text-sm bg-muted p-3 rounded-lg">
                                        {formatAnswers(selectedResponse.answers)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                                      <p className="text-sm">
                                        {format(new Date(selectedResponse.completed_at), "PPpp")}
                                      </p>
                                    </div>
                                  </div>
                                </ScrollArea>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
