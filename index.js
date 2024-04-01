const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const uuid = require('uuid').v4;
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

async function recordVideo(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const recorder = new PuppeteerScreenRecorder(page);

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
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Pass 2");
    await page.setViewport({ width: 1280, height: 720 });

    await recorder.start('simple.mp4');

    // console.log("Started Scroll video generation");
    // const bodyHandle = await page.$('body');
    // const { height } = await bodyHandle.boundingBox();
    // await bodyHandle.dispose();

    // const desiredDuration = 10; // Desired duration of the video in seconds
    // const frameRate = 5; // Frame rate of the video (frames per second)
    // const numFrames = desiredDuration * frameRate; // Total number of frames

    // // Calculate the scroll distance for smooth scrolling
    // const scrollDistance = height / numFrames;
    // // Calculate the delay between each scroll action
    // const scrollDelay = 1000 / frameRate;
    // // Set the duration of the pause in milliseconds
    // const pauseDuration = 2000;
    // // Set the number of frames to pause
    // const pauseIntervalFrames = 10;
    // // Calculate the total number of pauses
    // const totalPauses = Math.floor(numFrames / pauseIntervalFrames);
    // // Calculate the duration of scrolling without pause
    // const scrollDurationWithoutPause = (numFrames - totalPauses) * scrollDelay;

    // let framesScrolled = 0;
    // while (framesScrolled < numFrames) {
    //     // Scroll smoothly
    //     const framesToScrollWithoutPause = Math.min(numFrames - framesScrolled, pauseIntervalFrames);
    //     for (let i = 0; i < framesToScrollWithoutPause; i++) {
    //         await page.evaluate((scrollStep) => {
    //             window.scrollBy(0, scrollStep);
    //         }, scrollDistance);
    //         await new Promise(resolve => setTimeout(resolve, scrollDelay));
    //         // await page.waitFor(scrollDelay); // Wait for scrollDelay milliseconds
    //     }

    //     // Pause
    //     await new Promise(resolve => setTimeout(resolve, pauseDuration));

    //     // Update the total frames scrolled
    //     framesScrolled += framesToScrollWithoutPause;
    // }

    // Scroll 1000 pixels

    const duration = 1000;

    for(let i = 0; i < duration; i++)
    {
        await page.mouse.wheel({
            deltaY: 2,
        });
    }

    await recorder.stop();

    await browser.close();

    // await imagesToVideo(recording);
}



// function imagesToVideo(frames) {
//     fs.mkdirSync('temp', { recursive: true });
//     frames.forEach((frame, index) => {
//         fs.writeFileSync(`temp/image${index}.png`, frame.data, 'base64');
//     });

//     const command = `ffmpeg -framerate 10 -i temp/image%d.png -vf "fps=10,format=yuv420p" -t 10 ${uuid()}_output.mp4`;

//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`ffmpeg error: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.error(`ffmpeg stderr: ${stderr}`);
//             return;
//         }
//         console.log('Video recording complete!');

//         // Delete all files inside the 'temp' folder
//         fs.readdirSync('temp').forEach(file => {
//             fs.unlinkSync(path.join('temp', file));
//         });

//         // Remove the 'temp' folder itself
//         fs.rmdirSync('temp');
//     });
// }

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
