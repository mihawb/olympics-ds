const puppeteer = require('puppeteer');
const fs = require('fs');
const { all } = require('express/lib/application');

(async () => {
	// set up browser and page objects
	const browser = await puppeteer.launch()//{headless: false})

	const page = await browser.newPage()
	page.setViewport({ width: 1280, height: 720 })
	page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

	// data retrieving functions
	const getData = async () => {
		return await page.evaluate(async () => {
			return await new Promise(resolve => {
				const allbtns = document.querySelectorAll('[class^="styles__ItemButton"]')
				let result = []
				for (const btn of allbtns)
					result.push(btn.textContent)
				resolve(result)
			})
		})
	}

	// actual scraping
	await page.goto('https://olympics.com/en/olympic-games/olympic-results')

	const abs = await getData()
	console.log(abs[0])

	await page.screenshot({ path: 'olimptest.png' })

	await browser.close()
})()