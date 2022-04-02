const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    page.setViewport({width: 1280, height: 720})
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36")

    await page.goto('https://olympics.com/en/olympic-games/olympic-results')
    await page.evaluate(() => {
        const allps = document.querySelectorAll('p')
        allps[5].click()
    })
    
    await page.screenshot({ path: 'olimptest.png' })

    await browser.close()
})()