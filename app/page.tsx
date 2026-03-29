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
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&price=${price}&level=${level}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setCourses(data)
    } catch {
      setError("Something went wrong. Please try again.")
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
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="mb-8 text-4xl font-bold">SkillPath Finder</h1>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <input
            type="text"
            placeholder="Enter a skill or career goal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full max-w-md rounded border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none sm:w-auto"
          />

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={searchCourses}
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded bg-red-900/50 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {courses.length === 0 && !loading && !error && (
          <p className="text-slate-400">Enter a skill to find relevant courses</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <div
              key={index}
              className="rounded-lg bg-slate-800 p-6 text-left transition-transform hover:scale-[1.02]"
            >
              <h3 className="mb-3 text-lg font-semibold text-white">{course.title}</h3>
              <p className="mb-1 text-slate-300">Provider: {course.provider}</p>
              <p className="mb-1 text-slate-300">Rating: {course.rating || "N/A"}</p>
              <p className="mb-1 text-slate-300">Price: {course.price || "N/A"}</p>
              <p className="mb-4 text-slate-300">Duration: {course.duration || "N/A"}</p>
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
