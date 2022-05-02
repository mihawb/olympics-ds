const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
	// :root
	const btnType = {
		game: 'styles__ItemButton',
		sport: 'styles__WrapperButton',
		event: 'styles__WrapperLink',
		edit: 'styles__EditButton'
	}
	const GAMESCOUNT = 53;

	// set up browser and page objects
	const browser = await puppeteer.launch({ headless: false })

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 720 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	// data retrieving functions
	const getButtonsNames = async (btnclass) => {
		return await page.evaluate(async (btnclass) => {
			return await new Promise(resolve => {
				// add if: var for gamebtns and const for any other btns
				const btns = document.querySelectorAll(`[class^=${btnclass}]`)
				let result = []
				for (const btn of btns)
					result.push(btn.textContent)
				resolve(result)
			})
		}, btnclass)
	}

	const clickBtnWithTextContent = async (btntxt, btnclass) => {
		return await page.evaluate(async (btntxt, btnclass) => {
			const allbtns = document.querySelectorAll(`[class^="${btnclass}"]`)
			for (const btn of allbtns) {
				if (btn.textContent === btntxt) {
					btn.click()
					break
				}
			}
		}, btntxt, btnclass)
	}

	const clickBtnWithIndex = async (btnidx, btnclass) => {
		return await page.evaluate(async (btnidx, btnclass) => {
			const allbtns = document.querySelectorAll(`[class^="${btnclass}"]`)
			allbtns[btnidx].click()
		}, btnidx, btnclass)
	}

	const getAllEventLinks = async (btntype, gcount) => {
		return await page.evaluate(async (btntype, gcount) => {
			return await new Promise(async resolve => {
				function waitForElem(selector) {
					return new Promise(resolve => {
						if (document.querySelector(selector)) {
							return resolve(document.querySelector(selector));
						}
				
						const observer = new MutationObserver(mutations => {
							if (document.querySelector(selector)) {
								resolve(document.querySelector(selector));
								observer.disconnect();
							}
						});
				
						observer.observe(document.body, {
							childList: true,
							subtree: true
						});
					});
				}

				waitForElem('#onetrust-accept-btn-handler')
					.then(btn => btn.click())

				// musi byc tak bo sa na stronie 53 ukryte guziki i juz mam dosyc tej strony
				for (let gindex = 0; gindex < gcount; gindex++) {
					const gameBtns = document.querySelectorAll(`[class^="${btntype.game}"]`)
					gameBtns[gindex].click()
					console.log(gameBtns[gindex].textContent)

					let sbtn = await waitForElem(`[class^="${btntype.sport}"]`)
					const sportBtns = document.querySelectorAll(`[class^="${btntype.sport}"]`)
					console.log(sportBtns)

					document.querySelector(`[class^="${btntype.edit}"]`).click()
					const tbtn = await waitForElem(`[class^="${btntype.game}"]`)
				}
				resolve('dziala')
			})
		}, btntype, gcount)
	}

	// actual scraping
	await page.goto('https://olympics.com/en/olympic-games/olympic-results')

	// const gameBtns = await getButtonsNames(btnType.game)
	// await clickBtnWithIndex(5, btnType.game)

	// await page.waitForSelector(`[class^="${btnType.sport}"]`, { timeout: 10000 })
	// const sportBtns = await getButtonsNames(btnType.sport)
	// await clickBtnWithIndex(0, btnType.sport)
	
	// console.log(gameBtns[5], sportBtns[0])

	// await page.screenshot({ path: 'debugolimp.png' })

	const potwierdzenie = await getAllEventLinks(btnType, GAMESCOUNT)
	console.log(potwierdzenie)

	// await browser.close()
})()