import requests
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
from dateutil import parser
import time
import re

def scrape_ashby_jobs(company_name: str, board_token: str, experience_levels: Optional[List[str]] = None) -> List[Dict]:
    """Generic function to scrape jobs from any Ashby board

    Args:
        company_name: Name of the company (e.g., 'company_name')
        board_token: The board token from the company's Ashby URL
        experience_levels: List of experience levels to filter by (e.g., ['junior', 'mid-level'])
    """
    url = f"https://api.ashbyhq.com/posting-api/job-board/{board_token}?includeCompensation=true"
    last_6h = datetime.now(timezone.utc) - timedelta(hours=6)

    try:
        response = requests.get(url)
        print(f"Response status code: {response.status_code}")
        response.raise_for_status()

        jobs_data = response.json()
        print(f"Response keys: {jobs_data.keys()}")
        jobs = []

        job_postings = jobs_data.get('jobs', [])
        print(f"Found {len(job_postings)} job postings")

        for job in job_postings:
            # Extract basic job details
            title = job.get('title', '')
            department = job.get('department', '')
            location = job.get('location', 'Remote')
            
            # Extract experience level from title or department
            experience_level = get_experience_level(title)

            # Calculate hours ago from publishedAt
            published_date = parser.parse(job.get('publishedAt', ''))
            hours_ago = int((datetime.now(timezone.utc) - published_date).total_seconds() / 3600)

            # Get job URL
            job_url = job.get('jobUrl', '')

            # Create job entry
            job_entry = {
                'title': title,
                'department': department,
                'location': location,
                'experience_level': experience_level,
                'hours_ago': hours_ago,
                'url': job_url
            }

            # Filter by experience level if specified
            if experience_levels:
                if any(level.lower() in experience_level.lower() for level in experience_levels):
                    jobs.append(job_entry)
            else:
                jobs.append(job_entry)

        return jobs

    except requests.exceptions.RequestException as e:
        print(f"Error fetching jobs: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing jobs data: {str(e)}")
        return []

def get_experience_level(title: str) -> str:
    """Extract experience level from job title"""
    title_lower = title.lower()
    
    if any(level in title_lower for level in ['senior', 'sr.', 'lead', 'staff', 'principal']):
        return 'Senior'
    elif any(level in title_lower for level in ['mid', 'intermediate']):
        return 'Mid-Level'
    elif any(level in title_lower for level in ['junior', 'jr.', 'entry']):
        return 'Junior'
    else:
        return 'Not specified'

def get_role_type(title: str) -> str:
    """Determine the role type from the job title"""
    title_lower = title.lower()
    
    if any(role in title_lower for role in ['software engineer', 'software developer', 'backend engineer', 'frontend engineer', 'full stack', 'fullstack']):
        return 'Software Engineering'
    elif any(role in title_lower for role in ['data scientist', 'machine learning', 'ml engineer', 'ai engineer']):
        return 'Data Science'
    elif any(role in title_lower for role in ['product manager', 'product owner']):
        return 'Product Management'
    elif any(role in title_lower for role in ['designer', 'ux designer', 'ui designer']):
        return 'Design'
    elif any(role in title_lower for role in ['analyst', 'business analyst', 'data analyst']):
        return 'Analytics'
    else:
        return 'Other'

def identify_country(location: str) -> str:
    """Identify the country from a location string"""
    location_lower = location.lower()
    
    if any(state in location_lower for state in ['ca', 'ny', 'tx', 'fl', 'wa', 'ma']):
        return 'United States'
    elif 'united states' in location_lower or 'usa' in location_lower:
        return 'United States'
    elif 'united kingdom' in location_lower or 'uk' in location_lower:
        return 'United Kingdom'
    elif 'canada' in location_lower:
        return 'Canada'
    elif 'india' in location_lower:
        return 'India'
    elif 'australia' in location_lower:
        return 'Australia'
    elif 'germany' in location_lower:
        return 'Germany'
    elif 'remote' in location_lower:
        return 'Remote'
    
    return 'Unknown' 