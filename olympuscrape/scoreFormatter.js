const fs = require('fs')

// {Host, Year, Type}, Sport, Event, {place, country, participant, result, notes}

const scoresFilePath = '../data/scoresFromAllGamesNotParsed.csv'
const parsedFilePath = '../data/ScoresFromAllGames.csv'

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

function parseMedal(medal) {
	switch (medal) {
		case 'G':
			medal = '1'
			break
		case 'S':
			medal = '2'
			break
		case 'B':
			medal = '3'
			break
		default:
			medal = medal.replaceAll('=', '')
	}
	return medal
}

function parseCoutryCode(code) {
	return countryCodesEncoder[code] ? countryCodesEncoder[code] : code
}

function parseAthlete(name) {
	if (name !== '')
		return name.split(' ')
			   	   .map(w => w.charAt(0).toUpperCase() + w.substring(1))
			   	   .join(' ')
	else
		return 'Team discipline'
}

function parseResults(row) {
	row[8] = row[8].substring(8) 		// begining with Results:
	row[9] = row[9].substring(6)		// begining with Notes:
	
	// no result => check notes why so
	if (row[8] === '') 
		row[8] = row[9]

	// some results have garbage in them but still have notes attached
	else if (row[8].indexOf('$') != -1)
		row[8] = row[9]

	// parse results to seconsds, easier to analyse later
	else if (row[8].match(/[0-9]+:[0-9]{2}.[0-9]{2}/)) {
		const colonidx = row[8].indexOf(':')
		const dotidx = row[8].indexOf('.')

		const mins = parseInt(row[8].substring(0,colonidx))
		const secs = parseInt(row[8].substring(colonidx+1, dotidx))

		row[8] = (mins * 60 + secs).toString() + row[8].substring(dotidx)
	}

	switch (row[8]) {
		case 'DNF':
			row[8] = 'Did not finish'
			break
		case 'LAP':
			row[8] = 'Lapped'
			break
		case 'NM':
		case 'MNK':
			row[8] = 'mark unknown'
			break
		case 'NH':
			row[8] = '0'
			break
	}

	return row.splice(0, 9)
}

if (!fs.existsSync(scoresFilePath))
	throw `File ${scoresFilePath} not found`

if (fs.existsSync(parsedFilePath))
	fs.unlinkSync(parsedFilePath)

const dScores = fs.readFileSync(scoresFilePath, 'utf8').split('\n').map(d => d.split('; '))
fs.appendFileSync(parsedFilePath, 'Host;Year;Type;Sport;Event;Place;Country;Participant;Result')

for (let i = 0; i < dScores.length; i++) {
	process.stdout.write((i / dScores.length * 100).toFixed(5) + '%\r')
	dScores[i][5] = parseMedal(dScores[i][5])
	dScores[i][6] = parseCoutryCode(dScores[i][6])
	dScores[i][7] = parseAthlete(dScores[i][7])
	dScores[i] = parseResults(dScores[i])

	fs.appendFileSync(parsedFilePath, `${dScores[i].join(';')}${i+1 < dScores.length ? '\n' : ''}`)
}