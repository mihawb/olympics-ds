const puppeteer = require('puppeteer')
const fs = require('fs')

// {Host, Year, Type}, Sport, Event, {place, country [, participant, result, notes]}

const linkFilePath = '../data/eventlinks.csv'

const colType = {
	row: 'styles__Row',
	medal: 'styles__Medal',
	country: 'styles__CountryName',
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

	const disciplines = fs.readFileSync(linkFilePath, 'utf8').split('\n').map(d => d.split(','))
	// console.log(`${disciplines[0]}\n${disciplines[1]}\n${Array.isArray(disciplines[1])}`)

	const getInfoTableFrom = async (dLink, colType) => {
		await page.goto(dLink)

		return await page.evaluate(async (colType) => {

			return new Promise(resolve => {
				const rows = document.querySelectorAll(`[class^=${colType.row}]`)
				let resRows = []

				for (const row of rows) {
					let childrenTextContent = new Array(4)

					childrenTextContent[0] = row.querySelector(`[class^=${colType.medal}]`).textContent
					childrenTextContent[1] = row.querySelector(`[class^=${colType.country}]`).textContent
					childrenTextContent[2] = row.querySelector(`[class^=${colType.result}]`).textContent
					childrenTextContent[3] = row.querySelector(`[class^=${colType.notes}]`).textContent

					switch (childrenTextContent[0]) {
						case 'G':
							childrenTextContent[0] = '1'
							break
						case 'S':
							childrenTextContent[0] = '2'
							break
						case 'B':
							childrenTextContent[0] = '3'
							break
						default:
							childrenTextContent[0] = childrenTextContent[0].replaceAll('=', '')
							// childrenTextContent[0] = parseInt(childrenTextContent[0])
					}
					childrenTextContent[2] = childrenTextContent[2].substring(8)
					childrenTextContent[3] = childrenTextContent[3].substring(6)
					
					resRows.push(childrenTextContent)
				}
				resolve(resRows)
			})
		}, colType)
	}

	if (fs.existsSync('../data/scoresAllGames.csv'))
		fs.unlinkSync('../data/scoresAllGames.csv')

	if (fs.existsSync('../data/scoresErrs.log'))
		fs.unlinkSync('../data/scoresErrs.log')

	let linesRead = 0, linesWritten = 0
	for (const dLink of disciplines) {
		linesRead++
		if (linesRead > 10) break

		const scoresToPut = await getInfoTableFrom(dLink[5], colType)
		for (const scoreArr of scoresToPut) {
			linesWritten++

			// TODO define validating function with boolean return value
			if (scoreArr[0] === '' && (scoreArr[3] !== 'Did not finish' || scoreArr[3] !== 'Disqualified'))
				fs.appendFileSync('../data/scoresErrs.log', `Missing place or note on line ${linesWritten}\n`)

			fs.appendFileSync('../data/scoresAllGames.csv', `${dLink.slice(0,5).toString()},${scoreArr.toString()}\n`)
		}
		
		console.log(`link no. ${linesRead}, ${(linesRead / disciplines.length) * 100}%, ${dLink.slice(0,5).toString()}`)
	}

	browser.close()
})()
