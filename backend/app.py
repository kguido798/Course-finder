"""
SkillPath Finder - Python Backend
Run via Vercel Services with FastAPI
"""

import os
from typing import Optional
import fastapi
import fastapi.middleware.cors
import httpx

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo courses for when no API key is configured
DEMO_COURSES = [
    {
        "title": "Complete Python Bootcamp: From Zero to Hero",
        "provider": "Udemy",
        "rating": 4.6,
        "price": "$94.99",
        "duration": "22 hours",
        "url": "https://www.udemy.com/course/complete-python-bootcamp/",
        "level": "beginner"
    },
    {
        "title": "Python for Data Science and Machine Learning",
        "provider": "Udemy",
        "rating": 4.5,
        "price": "$89.99",
        "duration": "25 hours",
        "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        "level": "intermediate"
    },
    {
        "title": "Advanced Python Programming",
        "provider": "Udemy",
        "rating": 4.7,
        "price": "Free",
        "duration": "8 hours",
        "url": "https://www.udemy.com/course/advanced-python/",
        "level": "advanced"
    },
    {
        "title": "Web Development Masterclass",
        "provider": "Udemy",
        "rating": 4.8,
        "price": "$99.99",
        "duration": "40 hours",
        "url": "https://www.udemy.com/course/web-development-masterclass/",
        "level": "beginner"
    },
    {
        "title": "JavaScript: The Complete Guide",
        "provider": "Udemy",
        "rating": 4.7,
        "price": "$84.99",
        "duration": "52 hours",
        "url": "https://www.udemy.com/course/javascript-the-complete-guide/",
        "level": "beginner"
    },
    {
        "title": "React - The Complete Guide",
        "provider": "Udemy",
        "rating": 4.6,
        "price": "Free",
        "duration": "48 hours",
        "url": "https://www.udemy.com/course/react-the-complete-guide/",
        "level": "intermediate"
    },
    {
        "title": "Machine Learning A-Z",
        "provider": "Udemy",
        "rating": 4.5,
        "price": "$94.99",
        "duration": "44 hours",
        "url": "https://www.udemy.com/course/machinelearning/",
        "level": "intermediate"
    },
    {
        "title": "AWS Certified Solutions Architect",
        "provider": "Udemy",
        "rating": 4.7,
        "price": "$79.99",
        "duration": "27 hours",
        "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate/",
        "level": "advanced"
    },
    {
        "title": "Docker & Kubernetes: The Practical Guide",
        "provider": "Udemy",
        "rating": 4.8,
        "price": "Free",
        "duration": "23 hours",
        "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
        "level": "intermediate"
    }
]


def filter_courses(courses: list, query: str, price: str, level: str) -> list:
    """Filter courses based on search criteria"""
    filtered = []
    query_lower = query.lower()
    
    for course in courses:
        # Check if query matches title
        if query_lower not in course.get("title", "").lower():
            continue
            
        # Filter by price
        if price == "free":
            course_price = str(course.get("price", "")).lower()
            if "free" not in course_price and course_price != "0" and course_price != "$0":
                continue
        elif price == "paid":
            course_price = str(course.get("price", "")).lower()
            if "free" in course_price or course_price == "0" or course_price == "$0":
                continue
                
        # Filter by level
        if level != "all":
            course_level = course.get("level", "").lower()
            if course_level and course_level != level.lower():
                continue
                
        filtered.append(course)
    
    return filtered


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/search")
async def search_courses(
    query: str,
    price: Optional[str] = "all",
    level: Optional[str] = "all"
) -> list:
    """
    Search for courses based on query, price filter, and level filter
    """
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    
    if not rapidapi_key:
        # Use demo data if no API key is configured
        # For demo, return courses that loosely match any search
        demo_results = []
        query_lower = query.lower()
        
        for course in DEMO_COURSES:
            # Broader matching for demo purposes
            title_lower = course["title"].lower()
            matches_query = (
                query_lower in title_lower or
                any(word in title_lower for word in query_lower.split())
            )
            
            if matches_query or len(demo_results) < 3:
                # Apply price filter
                if price == "free":
                    if "free" not in course["price"].lower():
                        continue
                elif price == "paid":
                    if "free" in course["price"].lower():
                        continue
                
                # Apply level filter
                if level != "all" and course.get("level", "") != level:
                    continue
                    
                demo_results.append({
                    "title": course["title"],
                    "provider": course["provider"],
                    "rating": course["rating"],
                    "price": course["price"],
                    "duration": course["duration"],
                    "url": course["url"]
                })
        
        # Return at least some courses for demo
        if not demo_results:
            demo_results = [
                {
                    "title": c["title"],
                    "provider": c["provider"],
                    "rating": c["rating"],
                    "price": c["price"],
                    "duration": c["duration"],
                    "url": c["url"]
                }
                for c in DEMO_COURSES[:3]
                if (price == "all" or 
                    (price == "free" and "free" in c["price"].lower()) or
                    (price == "paid" and "free" not in c["price"].lower()))
                and (level == "all" or c.get("level", "") == level)
            ]
        
        return demo_results
    
    # Use RapidAPI Udemy scraper if key is available
    try:
        async with httpx.AsyncClient() as client:
            # Build the URL with filters
            api_url = f"https://udemy-course-scraper-api.p.rapidapi.com/courses/search?query={query}"
            
            if price == "free":
                api_url += "&price=price-free"
            elif price == "paid":
                api_url += "&price=price-paid"
            
            if level != "all":
                api_url += f"&level={level}"
            
            response = await client.get(
                api_url,
                headers={
                    "X-RapidAPI-Key": rapidapi_key,
                    "X-RapidAPI-Host": "udemy-course-scraper-api.p.rapidapi.com"
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise fastapi.HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch courses from API"
                )
            
            data = response.json()
            courses = data.get("courses", data) if isinstance(data, dict) else data
            
            if not isinstance(courses, list):
                courses = []
            
            # Format the response
            results = []
            for course in courses[:12]:  # Limit to 12 results
                results.append({
                    "title": course.get("title", "Untitled Course"),
                    "provider": "Udemy",
                    "rating": course.get("rating", course.get("avg_rating", "N/A")),
                    "price": course.get("price", "N/A"),
                    "duration": course.get("content_length", course.get("duration", "N/A")),
                    "url": course.get("url", f"https://www.udemy.com{course.get('url', '')}")
                })
            
            return results
            
    except httpx.TimeoutException:
        raise fastapi.HTTPException(status_code=504, detail="API request timed out")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))
