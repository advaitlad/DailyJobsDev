import requests
from concurrent.futures import ThreadPoolExecutor

def check_greenhouse_board(company):
    # Convert company name to lowercase and remove spaces/special chars
    board_token = company.lower().split()[0].replace('.', '').replace('&', '')
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return (company, True)
    except:
        pass
    return (company, False)

# List of US-based companies
companies = """
anthropic
""".strip().split('\n')

def main():
    greenhouse_companies = []
    
    # Use ThreadPoolExecutor to check multiple companies concurrently
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(check_greenhouse_board, companies))
    
    # Filter and sort companies that use Greenhouse
    greenhouse_companies = [company for company, uses_greenhouse in results if uses_greenhouse]
    greenhouse_companies.sort()
    
    # Print results
    print(f"\nFound {len(greenhouse_companies)} companies using Greenhouse:")
    for company in greenhouse_companies:
        print(f"- {company}")

if __name__ == "__main__":
    main()