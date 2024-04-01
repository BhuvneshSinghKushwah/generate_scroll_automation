const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const uuid = require('uuid').v4;

async function recordVideo(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    if (url.includes("linkedin.com")) {
        // Add a cookie named "li_at" with a provided value
        await page.setCookie({
            name: 'li_at',
            value: 'AQEDATOybg8F9NrxAAABjoa2PYcAAAGOqsLBh00Adbtm9EuyAbv8y68lbQlA-xO5Q55AgBLWiOwonfOMUyAx1O9mDdANFOhD02ym5xBBXFJ9OY-Vs9O-oKwOCVwi8aPBqnMYfRsFDg7ogVtbGP94UPDd',
            domain: '.www.linkedin.com',
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'None'
       });
    }

    console.log("Pass 1");
    await page.goto(url);
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    const element = await page.waitForSelector('#ember47', { timeout: 5000 });

    // Fix two clicks bug
    await element.click();
    // await element.click();
    console.log("Pass 2");
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log("Started Scroll video generation");
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    const desiredDuration = 15; // Desired duration of the video in seconds
    const frameRate = 10; // Frame rate of the video (frames per second)
    const numFrames = desiredDuration * frameRate; // Total number of frames
    const scrollDistance = height / numFrames; // Distance to scroll per frame

    async function scrollAndCaptureScreenshots() {
        const frames = [];

        for (let i = 0; i < numFrames; i++) {
            await page.evaluate((scrollDistance) => {
                window.scrollBy(0, scrollDistance);
            }, scrollDistance);

            const frame = await page.screenshot({ fullPage: false });
            frames.push(frame);
        }

        return frames;
    }

    const frames = await scrollAndCaptureScreenshots();

    await browser.close();

    await imagesToVideo(frames);
}

function imagesToVideo(frames) {
    fs.mkdirSync('temp', { recursive: true });
    frames.forEach((frame, index) => {
        fs.writeFileSync(`temp/image${index}.png`, frame);
    });

    const command = `ffmpeg -framerate 10 -i temp/image%d.png -vf "fps=10,format=yuv420p" -t 10 ${uuid()}_output.mp4`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`ffmpeg error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`ffmpeg stderr: ${stderr}`);
            return;
        }
        console.log('Video recording complete!');

        fs.rmdirSync('temp', { recursive: true });
    });
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