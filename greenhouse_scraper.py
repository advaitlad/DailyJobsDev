import requests
from datetime import datetime

def is_product_role(title):
    """Check if a job title is a product management role"""
    product_keywords = [
        'product manager',
        'product owner',
        'technical product manager',
        'product management'
    ]
    
    if not title:
        return False
        
    title_lower = title.lower()
    return any(keyword in title_lower for keyword in product_keywords)

def is_program_role(title):
    """Check if a job title is a program management role"""
    program_keywords = [
        'program manager',
        'programme manager',
        'technical program manager',
        'program management'
    ]
    
    if not title:
        return False
        
    title_lower = title.lower()
    return any(keyword in title_lower for keyword in program_keywords)

def get_role_type(title):
    """Determine if a role is a product or program management position"""
    if is_product_role(title):
        return 'product'
    elif is_program_role(title):
        return 'program'
    return None

def scrape_greenhouse_jobs(company_name, board_token):
    """Generic function to scrape jobs from any Greenhouse board

    Args:
        company_name: Name of the company (e.g., 'pinterest', 'stripe')
        board_token: The board token from the company's Greenhouse URL
    """
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs"

    try:
        response = requests.get(url)
        response.raise_for_status()

        jobs_data = response.json()['jobs']
        processed_jobs = []

        for job in jobs_data:
            title = job.get('title', 'N/A')
            
            # Determine role type
            role_type = get_role_type(title)
            if not role_type:
                continue
                
            try:
                department = job.get('departments', [{}])[0].get('name', 'N/A')
            except (IndexError, KeyError):
                department = 'N/A'

            location = job.get('location', {}).get('name', 'N/A')

            job_info = {
                'company': company_name.title(),
                'title': title,
                'location': location,
                'department': department,
                'job_id': f"{company_name}_{job.get('id', 'N/A')}",
                'updated_at': job.get('updated_at', 'N/A'),
                'url': job.get('absolute_url', 'N/A'),
                'date_scraped': datetime.now().isoformat(),
                'role_type': role_type
            }
            processed_jobs.append(job_info)

        return processed_jobs

    except requests.exceptions.RequestException as e:
        print(f"Error fetching jobs for {company_name}: {e}")
        return []
    except (KeyError, ValueError) as e:
        print(f"Error processing jobs for {company_name}: {e}")
        return []

# Define companies and their board tokens
COMPANIES = {
    'pinterest': 'pinterest',
    'samsara': 'samsara',
    'carvana': 'carvana',
    'spacex': 'spacex'
    # 'mongodb': 'mongodb',
    # 'datadog': 'datadog',
    # 'robinhood': 'robinhood',
    # 'brex': 'brex',
    # 'stripe': 'stripe',
    # 'airbnb': 'airbnb',
    # 'dropbox': 'dropbox',
    # 'asana': 'asana',
    # 'squarespace': 'squarespace',
    # 'instacart': 'instacart',
    # 'beyondfinance': 'beyondfinance',
    # 'lyft': 'lyft',
    # 'udemy': 'udemy',
    # 'wrike': 'wrike',
    # 'okta': 'okta',
    # 'yotpo': 'yotpo',
    # 'upwork': 'upwork',
    # 'groupon': 'groupon',
    # 'databricks': 'databricks',
    # 'twilio': 'twilio',
    # 'roblox': 'roblox',
    # 'esri': 'esri',
    # 'toast': 'toast',
    # 'affirm': 'affirm',
    # 'airtable': 'airtable',
    # 'amplitude': 'amplitude',
    # 'apptronik': 'apptronik',
    # 'buzzfeed': 'buzzfeed',
    # '23andme': '23andme',
    # 'braze': 'braze',
    # 'algolia': 'algolia',
    # 'airbyte': 'airbyte',
    # 'notion': 'notion',
    # 'figma': 'figma',
    # 'retool': 'retool',
    # 'faire': 'faire',
    # 'benchling': 'benchling',
    # 'vercel': 'vercel',
    # 'snyk': 'snyk',
    # 'hashicorp': 'hashicorp',
    # 'postman': 'postman',
    # 'gitlab': 'gitlab',
    # 'carta': 'carta',
    # 'gusto': 'gusto',
    # 'intercom': 'intercom',
    # 'netlify': 'netlify',
    # 'sentry': 'sentry',
    # 'webflow': 'webflow',
    # 'discord': 'discord',
    # 'fivetran': 'fivetran',
    # 'clickhouse': 'clickhouse',
    # 'cockroach': 'cockroachlabs'
}

def main():
    all_jobs = []

    # Scrape jobs from each company
    for company_name, board_token in COMPANIES.items():
        print(f"\nScraping jobs from {company_name.title()}...")
        jobs = scrape_greenhouse_jobs(company_name, board_token)
        if jobs:
            all_jobs.extend(jobs)
            print(f"Found {len(jobs)} jobs")
        else:
            print(f"No jobs found or error occurred")

    # Print all jobs
    print("\nAll Jobs Found:")
    for job in all_jobs:
        print(f"\nCompany: {job['company']}")
        print(f"Title: {job['title']}")
        print(f"Location: {job['location']}")
        print(f"Department: {job['department']}")
        print(f"Job ID: {job['job_id']}")
        print(f"URL: {job['url']}")
        print("-" * 80)

    # Print summary
    print("\nSummary:")
    print(f"Total jobs scraped: {len(all_jobs)}")
    for company in sorted(set(job['company'] for job in all_jobs)):
        company_jobs = len([job for job in all_jobs if job['company'] == company])
        print(f"{company}: {company_jobs} jobs")

if __name__ == "__main__":
    main() 