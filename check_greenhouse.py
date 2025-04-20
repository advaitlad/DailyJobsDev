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

# List of companies from the provided list
companies = """
Vivid Seats
Vivid Clear Rx
Vital
Vistra Energy
Vistar Media
Visier Solutions Inc
ViseVen
Vise
Visa
Virtuous
Virtru
Vimeo
Vim
VillageMD
Vidyard
Vidpro
Viavi Solutions
Viatris
Viamericas
Viam
Vialto
Veterinary Practice Partners
VetRec
Vet Source
Vestiaire Collective
Verto
Vertex Pharmaceuticals
Versatile
Versapay
Verra Mobility
Verneek
Verkada
Verizon
Veritone
VeriPark
Vercel
Veranex
Verana Health
Vera Institute of Justice
Veolia Environmental Services
Venu AI
Ventia
Venteur
Ventas
Venn
Venerable
Velan Studios
Veeva
Veepee
Vedantu
VectorShift
Vector Solutions
Vayu
Vay
Vast
Vasco
Varda
Vantage
Vanta
Vannevar Labs
Vanguard
Vanderlande
Vanderbilt University Medical Center
Vancouver Aquarium
Vance
Van Metre Companies
Van Andel Institute
ValueLabs
Value Momentum
Valora
Valor Hospitality
Valon
Valo Health
Valley Health
Valley Forge Casino Resort
Valero Energy
Valeo
Valence Labs
Valence
Valar Labs
Vail Systems Inc.
Vacations Hawaii & Nevada
VRAI
VNS Health
VML
VLCC
VITERRA
VICE Media
VIC.ai
VHC Health
VHA Home HealthCare
VGS
VF Corporation
VCU Health
VANS
Utila
Uthana
Usual
UserTesting
UserGems
Urban Renewal Authority
Urban Company
Upwork
Upwind Security
Upstox
Upstart
Uplimit
Upfluence
Upchieve
UpKeep
UpGuard
Unum Group
Unriddle
Unqork
Unlock Health
Unlimit
Unknown Worlds
University of Wisconsin-Madison
University of Washington Medicine
University of Rochester
University of Phoenix
University of Pennsylvania Health System
University of North Carolina
University of Nebraska System
University of Mississippi Medical Center
University of Michigan
University of Massachusetts Global
University of Maryland Global Campus
University of Maryland Eastern Shore
University of Illinois Hospital & Health Sciences System
University of Illinois
University of Florida Online
University of Chicago Medicine
University of California San Francisco Medical Center
University of California San Diego Health
University of California Los Angeles Health
University Of Western States
University Of Virginia
University Of Toronto
University Of Sydney
University Of Nevada Las Vegas
University Of Arkansas System
University Of Arizona Global Campus
Universal Parks & Resorts
Universal Orlando
Universal Health Services
Universal Engineering Sciences
Universal Electronics
Univeris
UnitedMasters
UnitedHealth Group
United Technologies
United Parks & Resorts
United Parcel Service
United Nations University
United Health Services
United Airlines Holdings
Unit21
Unit
Unisys
Uniswap Labs
Unison Infrastructure
Uniphore
Union54
Union Pacific Railroad
Unilever
UniUni Logistics
Underdog Sports
Under Armour
Unacademy
Umbra
Ultraviolet
Uline
Udio
Udemy
Udacity
Ubisoft
Ubiminds
Uber
UVA Health
UTA
UST
USC
USAA
US Mobile
Universal Postal Union
UPSIDE Foods
UPS
UPM
The Howard County Public School System
The Home Depot
The Heritage Group
The HartFord
The HALO Trust
The Grossmont-Cuyamaca Community College District
The Groove
The Global Fund
The Foundation for California Community Colleges
The Farmers Dog
The Essential
The Embry-Riddle Aeronautical University
The E.W. Scripps Company
The Depository Trust & Clearing Corporation
The Democratic Party
The Daily Beast
The College of Lake County
The Claremont Colleges Services
The City of Charlotte
The Cigna Group
The Children's Place
The Cheesecake Factory
The Brattle Group
The Boring Company
The Auto Club Group
The Athletic Media Company
The Allen Institute for AI
The Adaptavist Group
That's No Moon Entertainment
Thatch
Thales
Teya
Textron
Textio
Textile
Texas Capital Bank
Texas A&M University-San Antonio
Texas A&M International University
Tetra Tech
Testlio
Testbook
Test Gorilla
Tesorio
Tesla
Terremoto Biosciences
Terray Therapeutics
Terracon Consultants
TerrAscend
Tenstorrent University
Tennr
Tenet Healthcare
Tencent
Tenant Inc.
Tenable Inc
Temporal
Telus
Telstra
Telia
Telgorithm
Teleo
Teleno Group
Teladoc Health
Tekion
Teijin Automotive Technologies
Teecom
Tecton
Teck Resources Limited
Technology Services Corporation
Techland
Tech Mahindra
Tebra
TeamLease Digital
Tealium
Teads
Teachable
Taxfix
TaxGPT
Tavus
Tata Consultancy Services
Tata 1mg
TaskUs
Target
Tapcart
Tantum
Tanium Support
Tanium Solution Engineering
Tanium Sales
Tanium Product
Tanium Marketing
Tanium Internships
Tanium IT Security
Tanium G&A
Tanium Enterprise
Tanium Engineering
Tango
Tamara
Talroo
Tally Solutions
Talkiatry
TalkTalk For Everyone
Talentful
TalentSprint
Taktile
Takeda
Take Two
Tailscale
Tag
Tacto
Tactile Games
Taco Bell
Tabby
Taager
TYBA
TVS Motor
TULU
TTI
TRM Labs
TOKU
TNP
TMEIC Corporation Americas
TJX Companies
TIGERA
TIAA
THREATLOCKER
TEREX
TEL
TD SYNNEX
TD Ameritrade
TAPPP
TAAS Partners
T. Rowe Price
T-Mobile
Syntronic
Synthflow
Synthesia
Syntel
Synopsys
Syniverse
Synechron
Synchrony Financial
Synchron
Sync
Synapticure
Syna Media
Symphony.ai
Symphony
Symmetrio
Symetra
Sylvera
Syfe
Sword Health
Sword
Swisscom
Swissborg
Swiss Life Global Solutions
Swiggy
Swift
Swarovski
Swapcard
Suzy
Sutter Health
Sutherland
Survey Monkey
Surefox
Superside
Supermove
Superhuman
SuperGaming
Super.com
Supabase
Sunrise Farms
Sunrise
Sunflower
Sunday Riley
Suncoast Hotel & Casino
Sun Life
Sully.ai
Suki
Suger
Success Academy
Substack
Subscript
Subex
Stytch
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