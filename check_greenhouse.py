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
EZ Corp
EXL Service
EXL
EX.CO
EUV Tech
ETHOS
ETH - Ethics Office
EPRI
EPAM Systems
EOSG - Executive Office of the Secretary-General
Dynamo AI
Dutch Bros
Dusty Robotics
Duolingo
Dun & Bradstreet
Duke University Health System
Duke Energy
DuckDuckGo
DuPont
Dropbox
DroneDeploy
Drivetrain
Driven Brands
Dreamscape Learn
Drata
Draper
Dragos
Doxel
DowJones
Dow Inc.
Dow
Dover Corporation
Douglas County School
DoubleVerify
Dotdash Meredith
Dot
Doorstead
DoorDash USA
DoorDash Dashmart
DonorChoose
Domino's Pizza
Dominion Energy
Dollywood Parks & Resorts
Dollar Tree
Dollar General
Docusign
Document Crunch
Docker Inc
Ditto
Distributed Spectrum
Disney Parks, Experiences and Products
Disney
Discover Financial Services
Discover Dollar
Discover
Discord
Dillard's
Diligent Corporation
Dignity Health
DigitalOcean
DigitalEx
Digital Turbine
Digital Realty
Dick's Sporting Goods
Dice
Diamond Jo Worth Casino
Diamond Jo Casino
Diamond Foundry
Dialpad
Devrev.ai
Devoted Health
Department of Management
Denver The Mile High City
Democratic Governors Association
Demiurge Studio
Deluxe
Deltek
Delta Downs Racetrack Casino
Delta Air Lines
Deloitte US
Deloitte South Asia
Deloitte Middle East
Dell Technologies
Deleteme
Deepgram
Decimal
Decagon
Deca Games
DearDoc
Dealpath
DealHub.io
DeVry Education Group
Dbt Labs
Daybreak Health
Day & Zimmermann
Daxko
Davita
David Zwirner Gallery
Datasite
Dataminr
Dataiku
Datadog
Datacor
Databricks
Databento
DataGrail
DataDog
Darkroom
Darden Restaurants
Daniel J Edelman Holdings
Dandelion Energy
Dallas Area Rapid Transit
DairyLand Power
Daily Pay
DXC Technologies
DTE Energy
DSST Public Schools
DSS - Department of Safety and Security
DRW - US
DPR Family Of Companies
DPPA-DPO-SS - Department of Political and Peacebuilding Affairs
DPPA - Department of Political Affairs and Peace-building
DPO - Department of Peace Operations
DOS - Department of Operational Support
DMSPC - Department of Management Strategy, Policy and Compliance
DGC - Department of Global Communications
DGACM - Department for General Assembly and Conference Management
DESA RCNYO - Regional Commissions New York Office
DESA - Department of Economic and Social Affairs
DCM - Division of Conference Management
DAASH
D3
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