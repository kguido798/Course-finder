"use client"

import { useState } from "react"

interface Course {
  title: string
  provider: string
  rating: string | number
  price: string
  duration: string
  url: string
}

export default function SkillPathFinder() {
  const [query, setQuery] = useState("")
  const [price, setPrice] = useState("all")
  const [level, setLevel] = useState("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function searchCourses() {
    if (!query.trim()) {
      setError("Please enter a skill or career goal")
      return
    }

    setLoading(true)
    setError("")
    setCourses([])

    try {
      // Call the Python backend via /api prefix
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&price=${price}&level=${level}`)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to fetch courses")
      }
      
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      searchCourses()
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="mb-2 text-4xl font-bold text-balance">SkillPath Finder</h1>
        <p className="mb-8 text-muted-foreground">Powered by Python Backend</p>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <input
            type="text"
            placeholder="Enter a skill or career goal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full max-w-md rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={searchCourses}
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-md rounded-lg bg-red-900/50 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {courses.length === 0 && !loading && !error && (
          <p className="text-muted-foreground">Enter a skill to find relevant courses</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <div
              key={index}
              className="rounded-xl bg-card p-6 text-left transition-transform hover:scale-[1.02] border border-border"
            >
              <h3 className="mb-3 text-lg font-semibold text-card-foreground line-clamp-2">{course.title}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Provider: <span className="text-foreground">{course.provider}</span></p>
                <p>Rating: <span className="text-foreground">{course.rating || "N/A"}</span></p>
                <p>Price: <span className="text-foreground">{course.price || "N/A"}</span></p>
                <p>Duration: <span className="text-foreground">{course.duration || "N/A"}</span></p>
              </div>
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  View Course
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
