import { NextRequest, NextResponse } from "next/server"

// Demo courses data - used when no API key is configured
const demoCourses = [
  {
    title: "Complete Web Development Bootcamp",
    provider: "Udemy",
    rating: 4.7,
    price: "$12.99",
    duration: "65 hours",
    url: "https://www.udemy.com",
    level: "beginner"
  },
  {
    title: "JavaScript: The Complete Guide",
    provider: "Udemy",
    rating: 4.8,
    price: "Free",
    duration: "52 hours",
    url: "https://www.udemy.com",
    level: "intermediate"
  },
  {
    title: "React - The Complete Guide",
    provider: "Udemy",
    rating: 4.6,
    price: "$14.99",
    duration: "48 hours",
    url: "https://www.udemy.com",
    level: "intermediate"
  },
  {
    title: "Python for Data Science and Machine Learning",
    provider: "Udemy",
    rating: 4.5,
    price: "Free",
    duration: "25 hours",
    url: "https://www.udemy.com",
    level: "beginner"
  },
  {
    title: "Advanced CSS and Sass",
    provider: "Udemy",
    rating: 4.8,
    price: "$11.99",
    duration: "28 hours",
    url: "https://www.udemy.com",
    level: "advanced"
  },
  {
    title: "Node.js - The Complete Guide",
    provider: "Udemy",
    rating: 4.7,
    price: "$13.99",
    duration: "40 hours",
    url: "https://www.udemy.com",
    level: "intermediate"
  },
  {
    title: "TypeScript for Beginners",
    provider: "Udemy",
    rating: 4.4,
    price: "Free",
    duration: "12 hours",
    url: "https://www.udemy.com",
    level: "beginner"
  },
  {
    title: "AWS Certified Solutions Architect",
    provider: "Udemy",
    rating: 4.6,
    price: "$15.99",
    duration: "35 hours",
    url: "https://www.udemy.com",
    level: "advanced"
  }
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const price = searchParams.get("price") || "all"
  const level = searchParams.get("level") || "all"

  if (!query) {
    return NextResponse.json({ error: "Please enter a search term" }, { status: 400 })
  }

  const apiKey = process.env.RAPIDAPI_KEY

  // If no API key, use demo data with filtering
  if (!apiKey) {
    let filtered = demoCourses.filter(course => 
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().split(" ").some(word => 
        course.title.toLowerCase().includes(word)
      )
    )

    // If no matches, show all demo courses
    if (filtered.length === 0) {
      filtered = [...demoCourses]
    }

    // Apply price filter
    if (price === "free") {
      filtered = filtered.filter(c => c.price === "Free")
    } else if (price === "paid") {
      filtered = filtered.filter(c => c.price !== "Free")
    }

    // Apply level filter
    if (level !== "all") {
      filtered = filtered.filter(c => c.level === level)
    }

    // Return filtered courses without the level property
    return NextResponse.json(
      filtered.map(({ level: _, ...course }) => course)
    )
  }

  // Use RapidAPI if key is provided
  const url = `https://udemy-course-scraper-api.p.rapidapi.com/courses/search?query=${encodeURIComponent(query)}`

  const headers = {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": "udemy-course-scraper-api.p.rapidapi.com"
  }

  try {
    const response = await fetch(url, { headers })
    const data = await response.json()

    const courses = []

    for (const item of (data.courses || []).slice(0, 20)) {
      const course = {
        title: item.title,
        provider: "Udemy",
        rating: item.rating,
        price: item.price,
        duration: item.duration || "N/A",
        url: item.url
      }

      // Apply price filter
      if (price === "free" && course.price !== "Free") continue
      if (price === "paid" && course.price === "Free") continue

      courses.push(course)
    }

    return NextResponse.json(courses)
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 500 })
  }
}
