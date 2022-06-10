const fs = require('fs')

// Team, Name, Sport, Gold, Silver, Bronze, Games part., Year of Birth

const inputNotParsedPath = '../data/medalists2022NotParsed.csv'
const parsedFilePath = '../data/medalists2022.csv'

const countryCodesEncoder = {
	AUT:'Austria',NOR:'Norway',CAN:'Canada',SUI:'Switzerland',ISR:'Israel',
	ITA:'Italy',LIE:'Liechtenstein',IRL:'Ireland',MON:'Monaco',UKR:'Ukraine',
	KOS:'Kosovo',CHN:"People's Republic of China",CZE:'Czech Republic',
	FRA:'France',GER:'Germany',CHI:'Chile',SLO:'Slovenia',
	USA:'United States of America',ESP:'Spain',BOL:'Bolivia',SRB:'Serbia',
	AND:'Andorra',CRO:'Croatia',SVK:'Slovakia',BUL:'Bulgaria',
	NED:'Netherlands',AUS:'Australia',LAT:'Latvia',LUX:'Luxembourg',
	UZB:'Uzbekistan',COL:'Colombia',ROU:'Romania',HUN:'Hungary',
	MEX:'Mexico',POR:'Portugal',THA:'Thailand',ERI:'Eritrea',PUR:'Puerto Rico',
	MNE:'Montenegro',CYP:'Cyprus',TUR:'Turkey',KSA:'Saudi Arabia',IND:'India',
	JAM:'Jamaica',SWE:'Sweden',LTU:'Lithuania',BIH:'Bosnia and Herzegovina',
	TLS:'Democratic Republic of Timor-Leste',SMR:'San Marino',
	ROC:'Russian Olympic Committee',BEL:'Belgium',FIN:'Finland',KOR:'Republic of Korea',
	POL:'Poland',EST:'Estonia',ARG:'Argentina',GEO:'Georgia',ALB:'Albania',
	HKG:'Hong Kong, China',PHI:'Philippines',GRE:'Greece',KAZ:'Kazakhstan',
	HAI:'Haiti',LBN:'Lebanon',GHA:'Ghana',MAR:'Morocco',MAD:'Madagascar',
	BRA:'Brazil',ARM:'Armenia',GBR:'Great Britain',DEN:'Denmark',JPN:'Japan',
	ISL:'Iceland',TPE:'Chinese Taipei',MAS:'Malaysia',KGZ:'Kyrgyzstan',
	PAK:'Pakistan',NZL:'New Zealand',PER:'Peru',ECU:'Ecuador',BLR:'Belarus',
	IRI:'Islamic Republic of Iran',MDA:'Republic of Moldova',MGL:'Mongolia',
	NGR:'Nigeria',MKD:'North Macedonia',AZE:'Azerbaijan',ASA:'American Samoa',
	ISV:'Virgin Islands, US',MLT:'Malta',INA:'Indonesia',BAN:'Bangladesh',
	MAW:'Malawi',TUN:'Tunisia',VIE:'Vietnam',EGY:'Egypt',CHA:'Chad',
	BHU:'Bhutan',ETH:'Ethiopia',UGA:'Uganda',KEN:'Kenya',RSA:'South Africa',
	LBR:'Liberia',TTO:'Trinidad and Tobago',GUA:'Guatemala',BAH:'Bahamas',
	GRN:'Grenada',BOT:'Botswana',IVB:'Virgin Islands, British',QAT:'Qatar',
	BRN:'Bahrain',CUB:'Cuba',TAN:'United Republic of Tanzania',EOR:'Refugee Olympic Team',
	BDI:'Burundi',NAM:'Namibia',PAR:'Paraguay',LES:'Lesotho',PAN:'Panama',
	HON:'Honduras',RWA:'Rwanda',BUR:'Burkina Faso',ALG:'Algeria',CIV:"Côte d'Ivoire",
	CRC:'Costa Rica',DOM:'Dominican Republic',BEN:'Benin',SOL:'Solomon Islands',
	VEN:'Venezuela',DMA:'Dominica',SRI:'Sri Lanka',SGP:'Singapore',MRI:'Mauritius',
	SUR:'Suriname',MDV:'Maldives',MYA:'Myanmar',ZAM:'Zambia',JOR:'Jordan',
	GUY:'Guyana',CPV:'Cape Verde',SAM:'Samoa',TJK:'Tajikistan',
	PNG:'Papua New Guinea',ANT:'Antigua and Barbuda',COD:'Democratic Republic of the Congo',
	CMR:'Cameroon',SWZ:'Eswatini',SOM:'Somalia',ESA:'El Salvador',
	MOZ:'Mozambique',SEN:'Senegal',COK:'Cook Islands',STP:'Sao Tome and Principe',
	BIZ:'Belize',SYR:'Syrian Arab Republic',ZIM:'Zimbabwe',LBA:'Libya',
	FIJ:'Fiji',UAE:'United Arab Emirates',LAO:"Lao People's Democratic Republic",
	NIG:'Niger',DJI:'Djibouti',GAM:'Gambia',GUI:'Guinea',YEM:'Yemen',
	SUD:'Sudan',PLE:'Palestine',URU:'Uruguay',VAN:'Vanuatu',COM:'Comoros',
	GUM:'Guam',SLE:'Sierra Leone',SEY:'Seychelles',NCA:'Nicaragua',NEP:'Nepal',
	GBS:'Guinea-Bissau',TKM:'Turkmenistan',ANG:'Angola',KIR:'Kiribati',
	GAB:'Gabon',KUW:'Kuwait',BER:'Bermuda',IRQ:'Iraq',TOG:'Togo',
	LCA:'Saint Lucia',ARU:'Aruba',AFG:'Afghanistan',OMA:'Oman',TGA:'Tonga',
	MLI:'Mali',NRU:'Nauru',OAR:'Olympic Athletes from Russia',
	PRK:"Democratic People's Republic of Korea",RUS:'Russian Federation',
	GEQ:'Equatorial Guinea',BAR:'Barbados',SSD:'South Sudan',
	XXB:'Refugee Olympic Team',CAM:'Cambodia',CGO:'Congo',BRU:'Brunei Darussalam',
	CAF:'Central African Republic',FSM:'Federated States of Micronesia',
	PLW:'Palau',IOA:'Individual Olympic athletes',CAY:'Cayman Islands',
	VIN:'St Vincent and the Grenadines',MHL:'Marshall Islands',
	SKN:'Saint Kitts and Nevis',TUV:'Tuvalu',AHO:'Netherlands Antilles Olympic Committee',
	SCG:'Serbia and Montenegro',FRG:'Federal Republic of Germany',
	YAR:'Yemen Arab Republic',YUG:'Yugoslavia',MTN:'Mauritania',URS:'Soviet Union',
	TCH:'Czechoslovakia',GDR:'German Democratic Republic',VNM:'South Vietnam',
	RHO:'Southern Rhodesia',WIF:'West Indian Federation',MAL:'Federation of Malaya',
	UAR:'United Arab Republic',NBO:'North Borneo',SAA:'Saar',ANZ:'Australasia',
	BOH:'Bohemia',MIX:'Mixed team',NFL:'Newfoundland'
}

function parseCoutryCode(code) {
	return countryCodesEncoder[code]
}

function parseAthlete(name) {
		return name.split(' ')
			   	   .map(w => w.charAt(0).toUpperCase() + w.substring(1))
			   	   .join(' ')
}

function parseMedal(medal) {
	return medal === '-' ? '0' : medal
}

if (fs.existsSync(parsedFilePath))
	fs.unlinkSync(parsedFilePath)

const athletes = fs.readFileSync(inputNotParsedPath, 'utf8').split('\n').map(a => a.split('; '))

for (let i = 0; i < athletes.length; i++) {
	athletes[i][0] = parseCoutryCode(athletes[i][0])
	athletes[i][1] = parseAthlete(athletes[i][1])
	for (let j = 2; j < 6; j++)
		athletes[i][j] = parseMedal(athletes[i][j])	

	fs.appendFileSync(parsedFilePath, `${athletes[i].join('; ')}${i+1 < athletes.length ? '\n' : ''}`)
}