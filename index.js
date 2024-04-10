const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const uuid = require('uuid').v4;
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

async function linkedin_cookie_valid(browser) {
    const newPage = await browser.newPage();
    
    await newPage.goto('https://www.linkedin.com/my-items/saved-jobs/');
    
    const currentUrl = await newPage.mainFrame().url();
    console.log(currentUrl);
    
    if (currentUrl.includes('login')) {
        console.log('li_at expired');
        await newPage.close();
        return false;
    } 
    
    await newPage.close();
    return true;
}

async function recordVideo(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const recorder = new PuppeteerScreenRecorder(page);

    if (url.includes("linkedin.com")) {
        // Add a cookie named "li_at" with a provided value
        await page.setCookie({
            name: 'li_at',
            value: 'AQEDATOybg8AQ52qAAABjrNwIvQAAAGO13ym9EFVae5N70tNAoBRa-xJsNtX5fAzaOFygtgZRdHyBE3f3jh0k6XSf4VzaO09MBMmvdtDCwCnqXFfiuTw_CSOlF4SPre581YnS4cbcuhxImHwa-2YBo',
            domain: '.www.linkedin.com',
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'None'
        });
    }

    if(!await linkedin_cookie_valid(browser))
    {
        await browser.close();
        return null;
    }

    console.log("Pass 1");
    await page.goto(url);

    await new Promise(resolve => setTimeout(resolve, 2000));


    console.log("Pass 2");
    await page.setViewport({ width: 1280, height: 720 });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // const buttonId = "#ember49";

    // const buttonCoordinates = await page.evaluate((buttonId) => {
    //     const button = document.getElementById(buttonId);
    //     if (!button) {
    //         return null; // Button with provided ID not found
    //     }
    //     const rect = button.getBoundingClientRect();
    //     console.log(rect);
    //     console.log(rect.left + window.scrollX, rect.top + window.scrollY)
    //     return {
    //         x: rect.left + window.scrollX,
    //         y: rect.top + window.scrollY
    //     };
    // }, buttonId);

    // console.log(buttonCoordinates);

    await page.mouse.click(1217 + 20, 107.5 + 5);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('pass 3');


    // await new Promise(resolve => setTimeout(resolve, 3000000));

    await recorder.start(`${uuid()}_output.mp4`);

    const duration = 1000;

    for(let i = 0; i < duration; i++)
    {
        await page.mouse.wheel({
            deltaY: 2,
        });
    }

    await recorder.stop();

    await browser.close();
}


const url = "https://www.linkedin.com/in/santoshthota/";
if (!url) {
    console.error('Please provide a URL as an argument.');
    process.exit(1);
}

recordVideo(url)
    .then(() => {
        console.log('Video recording complete!');
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
