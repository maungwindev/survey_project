"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

// Survey questions data
const surveyQuestions = [
  {
    id: "q1",
    question: "What type of plastic is it ?",
    image: "/q1.jpeg",
    options: [
      { id: "a", text: "PET", isCorrect: true },
      { id: "b", text: "PVC", isCorrect: false },
      { id: "c", text: "Other", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "Which type of plastics is the most dangerous for carrying food ?",
    image: "/q2.png",
    options: [
      { id: "a", text: "PVC", isCorrect: true },
      { id: "b", text: "HDPE", isCorrect: false },
      { id: "c", text: "PET", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "What type of plastic is it ?",
    image: "/q3.jpeg",
    options: [
      { id: "a", text: "PET", isCorrect: false },
      { id: "b", text: "PP", isCorrect: true },
      { id: "c", text: "PVC", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "One of the harms of using plastics in the wrong way is.",
    image: "/q4.png",
    options: [
      { id: "a", text: "Sleepless issue", isCorrect: false },
      { id: "b", text: "Constipation", isCorrect: false },
      { id: "c", text: "Fertility problem", isCorrect: true },
    ],
  },
  {
    id: "q5",
    question: "What type of plastic is it?.",
    image: "/q5.jpeg",
    options: [
      { id: "a", text: "LDPE", isCorrect: true },
      { id: "b", text: "HDPE", isCorrect: false },
      { id: "c", text: "PET", isCorrect: false },
    ],
  },
  {
    id: "q6",
    question: "Which one is the best to use?",
    image: "/q6.jpeg",
    options: [
      { id: "a", text: "Pic 1", isCorrect: false },
      { id: "b", text: "Pic 2", isCorrect: true },
      // { id: "c", text: "Pic 3", isCorrect: false },
    ],
  },
  {
    id: "q7",
    question: "What is the impact of using plastics a lot?",
    image: "/q7.jpeg",
    options: [
      { id: "a", text: "Pic 1", isCorrect: false },
      { id: "b", text: "Pic 2", isCorrect: false },
      { id: "c", text: "Pic 3", isCorrect: true },
    ],
  },
  {
    id: "q8",
    question: "Which one harms the environment the most?",
    image: "/q8.jpg",
    options: [
      { id: "a", text: "Pic 1", isCorrect: false },
      { id: "b", text: "Pic 2", isCorrect: true },
    ],
  },
  {
    id: "q9",
    question: "Which one is correct ?",
    image: "/q9.jpg",
    options: [
      { id: "a", text: "Tr. Theingi looks like Lisa.", isCorrect: false },
      { id: "b", text: "Lisa looks like Tr. Theingi", isCorrect: true },
    ],
  },
  {
    id: "q10",
    question: "How many days did we attend this class until now?",
    image: "/q10.jpeg",
    options: [
      { id: "a", text: "45 days", isCorrect: false },
      { id: "b", text: "46 days", isCorrect: true },
      { id: "c", text: "47 days", isCorrect: false },
    ],
  },
]

export default function SurveyPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const usernameParam = searchParams.get("username")
    if (!usernameParam) {
      router.push("/")
      return
    }
    setUsername(usernameParam)
  }, [searchParams, router])

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    const detailedResults: Array<{
      questionId: string
      question: string
      userAnswer: string
      correctAnswer: string
      isCorrect: boolean
      userAnswerText: string
      correctAnswerText: string
    }> = []

    surveyQuestions.forEach((question) => {
      const userAnswerId = answers[question.id]
      const correctOption = question.options.find((opt) => opt.isCorrect)
      const userOption = question.options.find((opt) => opt.id === userAnswerId)

      const isCorrect = userAnswerId === correctOption?.id
      if (isCorrect) correctAnswers++

      detailedResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswerId || "",
        correctAnswer: correctOption?.id || "",
        isCorrect,
        userAnswerText: userOption?.text || "No answer",
        correctAnswerText: correctOption?.text || "",
      })
    })

    return {
      score: correctAnswers,
      totalQuestions: surveyQuestions.length,
      percentage: Math.round((correctAnswers / surveyQuestions.length) * 100),
      detailedResults,
    }
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = surveyQuestions.filter((q) => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. Missing: ${unansweredQuestions.length} question(s)`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const results = calculateScore()
      const supabase = createClient()

      // Get participant ID
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("username", username)
        .single()

      if (participantError || !participant) {
        throw new Error("Participant not found")
      }

      // Check if user already submitted
      const { data: existingResponse, error: checkError } = await supabase
        .from("survey_responses")
        .select("id")
        .eq("participant_id", participant.id)
        .single()

      if (existingResponse) {
        setError("You have already completed this survey")
        setIsSubmitting(false)
        return
      }

      // Determine result category
      let resultCategory = "Needs Improvement"
      if (results.percentage >= 80) resultCategory = "Excellent"
      else if (results.percentage >= 60) resultCategory = "Good"
      else if (results.percentage >= 40) resultCategory = "Fair"

      // Save survey response
      const { error: insertError } = await supabase.from("survey_responses").insert({
        participant_id: participant.id,
        username: username,
        answers: answers,
        total_score: results.score,
        max_possible_score: results.totalQuestions,
        percentage_score: results.percentage,
        result_category: resultCategory,
      })

      if (insertError) {
        throw insertError
      }

      // Redirect to results page
      const resultsData = encodeURIComponent(
        JSON.stringify({
          ...results,
          resultCategory,
          username,
        }),
      )

      router.push(`/results?data=${resultsData}`)
    } catch (error: any) {
      console.error("Survey submission error:", error)
      setError("Failed to submit survey. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!username) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100
  const question = surveyQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Survey Assessment</h1>
            <span className="text-sm text-muted-foreground">Welcome, {username}</span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {surveyQuestions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Image */}
            <div className="flex justify-center">
              <Image
                src={question.image || "/placeholder.svg"}
                alt={`Question ${currentQuestion + 1} illustration`}
                width={300}
                height={200}
                className="rounded-lg border border-border"
              />
            </div>

            {/* Answer Options */}
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer text-card-foreground">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {surveyQuestions.length} 
          </span>

          {currentQuestion === surveyQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Survey"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
