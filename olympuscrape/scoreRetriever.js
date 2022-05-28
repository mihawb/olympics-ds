const puppeteer = require('puppeteer')
const fs = require('fs')

// {Host, Year, Type}, Sport, Event, {place, country [, participant, notes]}

const linkFilePath = '../data/eventlinks.csv'

const colType = {
	row: 'styles__Row',
	medal: 'styles__MedalWrapper',
	country: 'styles__FlagWithLabelWrapper',
	athlete: 'styles__AthleteBlock',
	result: 'styles__ResultInfoWrapper',
	notes: 'styles__NotesInfoWrapper'
}

;(async () => {
	const browser = await puppeteer.launch()//{ headless: false })

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 720 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	if (!fs.existsSync(linkFilePath))
		throw `File ${linkFilePath} not found`

	const disciplines = fs.readFileSync(linkFilePath, 'utf8').split('\n').map(d => d.split(', '))
	// console.log(`${disciplines[0]}\n${disciplines[1]}\n${Array.isArray(disciplines[1])}`)

	const getInfoTableFrom = async (dLink, colType) => {
		await page.goto(dLink)

		return await page.evaluate(async (colType) => {

			return new Promise(resolve => {
				const rows = document.querySelectorAll(`[class^=${colType.row}]`)
				let resRows = []

				for (row of rows) {
					const childrenTextContent = Array.from(row.children).map(c => c.textContent)

					// processing inner text
					switch (childrenTextContent[0]) {
						case 'G':
							childrenTextContent[0] = 1
							break
						case 'S':
							childrenTextContent[0] = 2
							break
						case 'B':
							childrenTextContent[0] = 3
							break
						default:
							childrenTextContent[0] = childrenTextContent[0].replaceAll('=', '')
							childrenTextContent[0] = parseInt(childrenTextContent[0])
					}
					childrenTextContent[3] = childrenTextContent[3].substring(8)
					childrenTextContent[4] = childrenTextContent[4].substring(6)

					resRows.push(childrenTextContent)
				}
				resolve(resRows)
			})
		}, colType)
	}
	
	const firstrowarr = await getInfoTableFrom(disciplines[1][5], colType)
	
	for (el of firstrowarr)
		console.log(el)

	browser.close()
})()
