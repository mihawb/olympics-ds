const puppeteer = require('puppeteer')
const fs = require('fs')

const btnType = {
	game: 'styles__ItemButton',
	sport: 'styles__WrapperButton',
	event: 'styles__WrapperLink',
	edit: 'styles__EditButton'
}

const GAMESCOUNT = 53
const resultsURL = 'https://olympics.com/en/olympic-games/olympic-results'
const eventLinksFilePath = '../data/eventlinks.csv'

;(async () => {
	// set up browser and page objects
	const browser = await puppeteer.launch() // { headless: false }) // for debugging purposes

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 720 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	// data retrieving functions
	// have to be here since they relay on the page object

	const getAllEventLinks = async (btntype, gcount) => {
		return await page.evaluate(async (btntype, gcount) => {
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

				const links = []

				waitForElem('#onetrust-accept-btn-handler')
					.then(btn => btn.click())

				// musi byc tak bo sa na stronie 53 ukryte guziki i juz mam dosyc tej strony
				for (let gindex = 0; gindex < gcount; gindex++) {
					const gameBtns = document.querySelectorAll(`[class^="${btntype.game}"]`)
					
					console.log(gameBtns[gindex].textContent)
					gameBtns[gindex].click()
					
					await waitForElem(`[class^="${btntype.sport}"]`)
					const scount = document.querySelectorAll(`[class^="${btntype.sport}"]`).length

					for (let sindex = 0; sindex < scount; sindex++) {
						const sportBtns = document.querySelectorAll(`[class^="${btntype.sport}"]`)

						sportBtns[sindex].click()

						await waitForElem(`[class^="${btntype.event}"]`)
						const eventBtns = document.querySelectorAll(`[class^="${btntype.event}"]`)

						for (const evt of eventBtns) {
							links.push(`${gameBtns[gindex].textContent}; ${sportBtns[sindex].textContent}; ${evt.textContent}; ${evt.href}`)
						}

						document.querySelectorAll(`[class^="${btntype.edit}"]`)[1].click()
						await waitForElem(`[class^="${btntype.sport}"]`)
					}

					document.querySelector(`[class^="${btntype.edit}"]`).click()
					await waitForElem(`[class^="${btntype.game}"]`)
				}
				resolve(links)
			})
		}, btntype, gcount)
	}

	// actual scraping
	await page.goto(resultsURL)

	if (fs.existsSync(eventLinksFilePath))
		fs.unlinkSync(eventLinksFilePath)

	const allLinks = await getAllEventLinks(btnType, GAMESCOUNT)

	for (let i = 0; i < allLinks.length; i++) {
		const entry = allLinks[i]
		const idx = /[0-9]{4}/.exec(entry).index - 1 // no need to check if .index exists since year will always match
		entry = entry.substring(0, idx) + '; ' + entry.substring(idx+1, idx+5) + '; ' + entry.substring(idx+5)
		fs.appendFileSync(eventLinksFilePath, `${entry}${i+1 < allLinks.length ? '\n' : ''}`)
	}

	await browser.close()
})()