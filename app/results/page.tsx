"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, Home } from "lucide-react"

interface QuestionResult {
  questionId: string
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  userAnswerText: string
  correctAnswerText: string
}

interface ResultsData {
  score: number
  totalQuestions: number
  percentage: number
  detailedResults: QuestionResult[]
  resultCategory: string
  username: string
}

export default function ResultsPage() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (!dataParam) {
      router.push("/")
      return
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(dataParam))
      setResultsData(decoded)
    } catch (error) {
      console.error("Failed to parse results data:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, router])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
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

  const getPassFailStatus = (percentage: number) => {
    return percentage >= 60 ? { status: "PASS", color: "text-green-600" } : { status: "FAIL", color: "text-red-600" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No results data found</p>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passFailStatus = getPassFailStatus(resultsData.percentage)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-secondary mr-2" />
            <h1 className="text-3xl font-bold text-foreground">Survey Results</h1>
          </div>
          <p className="text-muted-foreground">Here's how you performed, {resultsData.username}!</p>
        </div>

        {/* Score Summary */}
        <Card className="mb-8 border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-card-foreground">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(resultsData.percentage)} mb-2`}>
                {resultsData.percentage}%
              </div>
              <p className="text-lg text-muted-foreground">
                {resultsData.score} out of {resultsData.totalQuestions} correct
              </p>
            </div>

            <Progress value={resultsData.percentage} className="w-full h-3" />

            <div className="flex items-center justify-center gap-4">
              <Badge className={getCategoryColor(resultsData.resultCategory)}>{resultsData.resultCategory}</Badge>
              <Badge
                className={`${passFailStatus.status === "PASS" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
              >
                {passFailStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Question Review</h2>

          {resultsData.detailedResults.map((result, index) => (
            <Card key={result.questionId} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-card-foreground flex-1">
                    Question {index + 1}: {result.question}
                  </CardTitle>
                  <div className="ml-4">
                    {result.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* User's Answer */}
                <div
                  className={`p-3 rounded-lg border-2 ${
                    result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Your Answer:</span>
                    {result.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className={`font-medium ${result.isCorrect ? "text-green-700" : "text-red-700"}`}>
                    {result.userAnswerText}
                  </p>
                </div>

                {/* Correct Answer (only show if user was wrong) */}
                {!result.isCorrect && (
                  <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Correct Answer:</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="font-medium text-green-700">{result.correctAnswerText}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push("/")} variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Take Another Survey
          </Button>
          <Button
            onClick={() => router.push("/admin")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            View All Results
          </Button>
        </div>
      </div>
    </div>
  )
}
