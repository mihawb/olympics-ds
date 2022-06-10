const puppeteer = require('puppeteer')
const fs = require('fs');
const res = require('express/lib/response');

// team, name, sport, gold, silver, bronze, link => (games participated, year of birth)

const styles = {
	row: 'styles__AthleteRow',
	team: 'styles__CountryName',
	athlete: 'styles__AthleteName',
	sport: 'styles__SportText',
	medals: 'Medalstyles__Medal',
	waitbtn: 'Buttonstyles__Button',
	wrapper: 'styles__Wrapper',
	details: 'detail__list'
}

const medalistsLink = 'https://olympics.com/en/olympic-games/beijing-2022/athletes'
const resultNotParsedPath = '../data/medalists2022NotParsed.csv'

;(async () => {
	const browser = await puppeteer.launch()

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 1000 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	await page.goto(medalistsLink)

	const getAthletes = async (styles) => {
		return await page.evaluate(async (styles) => {
			return await new Promise(async resolve => {

				const waitForElem = (selector) => {
					return new Promise(resolve => {
						if (document.querySelector(selector)) {
							return resolve(document.querySelector(selector))
						}

						const observer = new MutationObserver(mutations => {
							if (document.querySelector(selector)) {
								resolve(document.querySelector(selector))
								observer.disconnect()
							}
						})

						observer.observe(document.body, {
							childList: true,
							subtree: true
						})
					})
				}

				const afterLoad = () => {
					console.log("loaded everything")
					const athletesCollection = document.querySelectorAll(`[class^="${styles.row}"]`)
					const athletes = []
					for (const athElem of athletesCollection) {
						const currAth = []
						currAth.push(athElem.querySelector('a').href)
						currAth.push(athElem.querySelector(`[class^="${styles.team}"]`).textContent)
						currAth.push(athElem.querySelector(`[class^="${styles.athlete}"]`).textContent)
						currAth.push(athElem.querySelector(`[class^="${styles.sport}"]`).textContent)

						const medalsCollection = athElem.querySelectorAll(`[class^="${styles.medals}"]`)
						for (const medal of medalsCollection) // cannot use map since HTMLCollection is not an Array object
							currAth.push(medal.textContent)

						athletes.push(currAth)
					}
					resolve(athletes)
				}

				const btnobs = new MutationObserver(muts => {
					if (tID) {
						clearTimeout(tID)
						tID = null
					}
					tID = setTimeout(afterLoad, 15000)
					for (const mut of muts) {
						if (mut.removedNodes.length != 0) continue
						if (mut.target.className.substring(0, 15) === styles.wrapper) {
							mut.target.querySelector(`[class^="${styles.waitbtn}"]`).click()
						}
					}
				})

				const sets = {childList: true, subtree: true}
				tID = null // has to be window's property

				waitForElem('#onetrust-accept-btn-handler')
					.then(btn => btn.click())

				btnobs.observe(document.body, sets)
				document.querySelector(`[class^="${styles.waitbtn}"]`).click() // first click has to be manual
			})
		}, styles)
	}

	const getAthMoreData = async (aLink, styles) => {
		await page.goto(aLink)

		return await page.evaluate(async (styles) => {
			return new Promise(resolve => {
				let gPart = ''
				let bYear = ''

				const detailsCollection = document.querySelector(`[class^="${styles.details}"]`).childNodes

				for (const det of detailsCollection) {
					// those come without a class and not always in the same quantity
					// also some are plain text and thus dont have querySelector method
					try {
						if (det.querySelector('.col-left').textContent === 'Games participations')
							gPart = det.querySelector('.col-right').textContent
						else if (det.querySelector('.col-left').textContent === 'Year of Birth')
							bYear = det.querySelector('.col-right').textContent
					}
					catch {/* block required but functionally not needed */}
				}

				resolve([gPart, bYear])
			})
		}, styles)
	}

	const athleteArray = await getAthletes(styles)

	if (fs.existsSync(resultNotParsedPath))
		fs.unlinkSync(resultNotParsedPath)

	for (let i = 0; i < athleteArray.length; i++) {
		console.log(`${((i+1) / athleteArray.length) * 100}%`)

		const [gamesPart, yearOfBirth] = await getAthMoreData(athleteArray[i][0], styles)

		fs.appendFileSync(resultNotParsedPath,
			`${athleteArray[i].slice(1).join('; ')}; ${gamesPart}; ${yearOfBirth}${i+1 < athleteArray.length ? '\n' : ''}`)
	}

	await browser.close()
})()