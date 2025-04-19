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
Zithara AI
Zipline
Zinnia
Zillow
Zilliant
Zifornd
Zeta
Zero Networks
Zeotap
Zentiva
Zensar Technologies
Zenrows
Zeno Group
Zenlayer
Zendesk
Zello
Zeller
Zelis
Zeitview
Zebra
Zayo
Zapier
Zapcom Group
Zalando
ZYCUS
ZURU
ZRS Management
ZIM Integrated Shipping Services
ZF
ZEDEDA
Yuno
Yuma AI
Yum Brands
Yulu Bikes
Yubico
Yubi
Yourstory
YouGov
Yotoplay
Yoobic
Ynab
Yext
Yeti
Yes Property
Yellowbrick Data
Yahoo
YORK.IE
YAI
Y-Combinator
Xsolla
Xometry
Xero
Xeno
Xeni
Xendit
Xcel Energy
Xcede
Xapobank
Xapo Bank
XUND
XPO Logistics
XAI
X (Twitter)
Wynn Resorts
Wyndham Hotels & Resorts
Wynd
Wunderkind
Writer
Wrike
Wpromote
Worldly
WorldQuant
World Vision
World Trade Organization
World Tourism Organization
World Relief
World Market
World Labs
World Kinect
World Finance
World Economic Forum
World Bank Group
Workwise
Workos
Workiva
Working Solutions
Workhelix
Workera
Worker Compensation Board
Workday
Workato
WorkWave
WorkRamp
Wordware
Wooga
Woodward
Woodruff Arts Center
Woodard & Curran
Wood Mackenzie
Wood
Wonderschool
Wolters Kluwer
Wizcorp
With Intelligence
Wistron NeWeb Corporation
Wisk Aero
Wiser
Wise
Wipro
Winzo
WinnCompanies
Winland Foods
Wing Assistant
Wing
Wine Rack
Windriver
Window Nation
Wincent
Wilson & Company
WillowTree
Willis Towers Watson
Williams Sonoma
Williams Lea
Wildlife Studios
Wild Adventures
Wilbur-Ellis
Wikimedia
Whoop
Whole Foods Market
Whitby
Whisper Aero
Wherobots
Whatfix
WhatNot
Western Union
Western Nevada College
Western Governors University
Western Alliance BanCorporation
Wesleyan
Wescom Financial
Wendy's
Welocalize
Wellstar
Wellsfargo
Wells Fargo
Wellington Management
Wellfound
Wellesley
WellPower
Weir
Weights & Biases
Wegmans
Webflow
Web Summit
Weaver Stone Company
Wealthsimple
Wealthfront
Wealth Financial Technologies
Wealth Enhancement
WeWorkRemotely
WeWork India
WeTravel
WeRide.ai
Wayve
Waymo
Wayfair
Way
Wawa
Watershed
Waterplan
Watco Companies
WatchGuard Technologies
Waste Connections
Washington University School of Medicine
Washburn Center for Children
Warner Music Group
Warner Bros. Entertainment
Warner Bros. Discovery
War Gaming
Wanderlog
Wander
Waltz Health
Walnut
Walmart
Walk Me
Walgreens Boots Alliance
Walden Security
Wakefit
Wake Forest University
Wake Forest Baptist Health
Wabtec Corporation
Waabi
WTO
WSFS Financial Corporation
WSECU
WMO
WIPO
WINAMAX
WHO
WFP
WEX
WEC Energy Group
WEBTOON Entertainment Inc
WCO
WADA
Vultr
Voya
Vox Media
Vooma
Vonage
Volvo
Volley
Voleon
Voldex
Voices
Vodafone
Vizit
Vivriti Capital
VivoSense
Vivid Seats
Vivid Clear Rx
Vital
Vistra Energy
Vistar Media
Visier Solutions
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