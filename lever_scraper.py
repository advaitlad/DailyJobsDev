import requests
from datetime import datetime, timezone, timedelta
import time
import re
from dateutil.tz import tzutc
from analyze_locations import identify_country
from greenhouse_scraper import get_role_type, get_experience_level
import csv
import json
import os

def load_lever_companies():
    """Load Lever companies from config file"""
    config_path = os.path.join('docs', 'lever_companies_config.json')
    with open(config_path, 'r') as f:
        return json.load(f)['companies']

def scrape_lever_jobs(company_name, lever_subdomain):
    """
    Scrape jobs from a Lever job board given the subdomain.
    Returns a list of job dicts matching the Greenhouse job doc structure.
    Only includes jobs updated in the last 6 hours.
    """
    url = f"https://api.lever.co/v0/postings/{lever_subdomain}?mode=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        jobs_data = response.json()
    except Exception as e:
        print(f"Error fetching jobs for {company_name}: {e}")
        return []

    processed_jobs = []
    now = datetime.now(tz=tzutc())
    # last_6h = now - timedelta(hours=6)
    last_72h = now - timedelta(hours=72)
    for job in jobs_data:
        # Use updatedAt if available, else fallback to createdAt
        updated_at_ms = job.get('updatedAt') or job.get('createdAt')
        if not updated_at_ms:
            continue
        updated_at = datetime.fromtimestamp(updated_at_ms / 1000, tz=tzutc())
        if updated_at <= last_72h:
            continue
        title = job.get('text', 'N/A')
        role_type = get_role_type(title)
        if not role_type:
            continue
        experience_level = get_experience_level(title)
        department = job.get('categories', {}).get('team', 'N/A')
        location = job.get('categories', {}).get('location', 'N/A')
        # Handle multiple locations (separated by semicolons)
        if ';' in location:
            locations = [loc.strip() for loc in location.split(';')]
            countries = set()
            for loc in locations:
                if 'remote' in loc.lower():
                    countries.add('Remote')
                    loc = re.sub(r'remote,?\s*', '', loc, flags=re.IGNORECASE).strip()
                    if loc:
                        country = identify_country(loc)
                        if country != 'Unknown':
                            countries.add(country)
                else:
                    country = identify_country(loc)
                    if country != 'Unknown':
                        countries.add(country)
        else:
            if 'remote' in location.lower():
                countries = {'Remote'}
                loc = re.sub(r'remote,?\s*', '', location, flags=re.IGNORECASE).strip()
                if loc:
                    country = identify_country(loc)
                    if country != 'Unknown':
                        countries.add(country)
            else:
                country = identify_country(location)
                countries = {country} if country != 'Unknown' else set()
        countries_map = {str(i): country for i, country in enumerate(sorted(countries))}
        job_id = f"{company_name.lower()}_{job.get('id', 'N/A')}"
        url_ = job.get('hostedUrl', 'N/A')
        hours_ago = round((now - updated_at).total_seconds() / 3600, 1)
        job_info = {
            'company': company_name.title(),
            'title': title,
            'location': location,
            'countries': countries_map,
            'department': department,
            'job_id': job_id,
            'hours_ago': hours_ago,
            'url': url_,
            'role_type': role_type,
            'updated_at': updated_at,
            'experience_level': experience_level
        }
        processed_jobs.append(job_info)
    print(f"Found {len(processed_jobs)} jobs for {company_name}")
    return processed_jobs

def export_jobs_to_csv(jobs, filename):
    fieldnames = [
        'company', 'title', 'location', 'countries', 'department', 'job_id',
        'hours_ago', 'url', 'role_type', 'updated_at', 'experience_level'
    ]
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for job in jobs:
            row = job.copy()
            # Convert countries dict to a string for CSV
            row['countries'] = '; '.join(row['countries'].values()) if row['countries'] else ''
            # Format updated_at as ISO string
            if row['updated_at']:
                row['updated_at'] = row['updated_at'].isoformat()
            writer.writerow(row)

if __name__ == "__main__":
    all_jobs = []
    companies = load_lever_companies()
    for company_name, lever_subdomain in companies.items():
        jobs = scrape_lever_jobs(company_name, lever_subdomain)
        all_jobs.extend(jobs)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'all_lever_jobs_{timestamp}.csv'
    export_jobs_to_csv(all_jobs, filename)
    print(f"Exported {len(all_jobs)} jobs to {filename}") 