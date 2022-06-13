const puppeteer = require('puppeteer')
const fs = require('fs');

const linkFilePath = '../data/eventlinks.csv'
const resultsFilePath = '../data/scoresFromAllGamesNotParsed.csv'

const colType = {
	row: 'styles__Row',
	medal: 'styles__Medal',
	country: 'styles__CountryName',
	athlete: 'styles__AthleteName',
	result: 'styles__ResultInfoWrapper',
	notes: 'styles__NotesInfoWrapper'
}

;(async () => {
	const browser = await puppeteer.launch() // { headless: false })

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 720 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	if (!fs.existsSync(linkFilePath))
		throw `File ${linkFilePath} not found`

	const disciplines = fs.readFileSync(linkFilePath, 'utf8').split('\n').map(d => d.split('; '))

	const getInfoTableFrom = async (dLink, colType) => {
		await page.goto(dLink)

		return await page.evaluate(async (colType) => {

			return new Promise(resolve => {
				const rows = document.querySelectorAll(`[class^=${colType.row}]`)
				let resRows = []

				for (const row of rows) {
					let rowResults = new Array(5)

					rowResults[0] = row.querySelector(`[class^=${colType.medal}]`).textContent
					rowResults[1] = row.querySelector(`[class^=${colType.country}]`).textContent
					rowResults[2] = row.querySelector(`[class^=${colType.athlete}]`) ? row.querySelector(`[class^=${colType.athlete}]`).textContent : ''
					rowResults[3] = row.querySelector(`[class^=${colType.result}]`).textContent
					rowResults[4] = row.querySelector(`[class^=${colType.notes}]`).textContent
					
					resRows.push(rowResults)
				}
				resolve(resRows)
			})
		}, colType)
	}

	const sleep = (ms) => {
		return new Promise((resolve) => {
		  setTimeout(resolve, ms)
		})
	  }

	
	const scrapeStart = 0					// in case of errors midway through
	const scrapeEnd = disciplines.length 	// results file is appended in each iteration => no need to start from scratch again
	
	if (fs.existsSync(resultsFilePath))
		fs.unlinkSync(resultsFilePath)

	for (let i = scrapeStart; i < scrapeEnd; i++) {
		// console.log(disciplines[i])
		const scoresToPut = await getInfoTableFrom(disciplines[i][5], colType)
		for (const scoreArr of scoresToPut) {
			fs.appendFileSync(resultsFilePath, `${disciplines[i].slice(0,5).join('; ')}; ${scoreArr.join('; ')}\n`)
			await sleep(15) // Error: EBUSY: resource busy or locked = trouble accessing file on the OS level
		}
		
		console.log(`link no. ${i+1}, ${(((i+1) / disciplines.length) * 100).toFixed(5)}%, ${disciplines[i].slice(0,5).join('; ')}`)
	}

	browser.close()
})()
