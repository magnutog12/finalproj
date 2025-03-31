//https://pptr.dev/guides/getting-started
//https://www.zenrows.com/blog/puppeteer-web-scraping#submit-forms
//https://www.youtube.com/watch?v=mB3KPacNPto
// Heavily inspired by:
//https://www.youtube.com/watch?v=FKkDUW4E2Qc

import puppeteer from 'puppeteer';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// fixes error for dirname not being defined. https://stackoverflow.com/questions/64383909/dirname-is-not-defined-error-in-node-js-14-version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//https://flaviocopes.com/how-to-download-and-save-an-image-using-nodejs/
async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    }) 
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
        .on('error', reject)
        .once('close', () => resolve(filepath))
    })

  }
 
// asyncronous function to handle awaits
(async () => {
   
    // launch and set it to view to avoid bot detection
    const browser = await puppeteer.launch({
        headless: false, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://www.homefacts.com/offenders/Tennessee/Knox-County.html');

    let pageNum = 1;
    let lastPage = 45;
    let allResults = [];

    // go to specific html block
    await page.waitForSelector('.registeredOffenders');
    
    // mimic human behaivor by randomizing mouse movements
    const humanBehavior = async (page) => {
        await page.mouse.move(Math.random() * 1920, Math.random() * 1080, { steps: 10 });
        await page.evaluate(() => {
            window.scrollTo({
                top: Math.random() * document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
    };

    while(pageNum <= lastPage){

        await humanBehavior(page);

        const results = await page.evaluate(() => {
            // create an array of registered offenders by query selecting the sections HTML
            const offenders = Array.from(document.querySelectorAll('.registeredOffenders li[itemtype="https://schema.org/Person"]'));
            // make a map and set each offenders data
            const data = offenders.map( offender => {
                const name = offender.querySelector('a[itemprop="url"]').getAttribute('title');
                let img = offender.querySelector('img[itemprop="image"]').getAttribute('src');
                
                if(img && !img.startsWith('http')){
                    img = `https://www.homefacts.com${img}`;
                }

                const address = offender.querySelector('span[itemprop="streetAddress"]').textContent.trim();
                const locality = offender.querySelector('span[itemprop="addressLocality"]').textContent.trim();
                const detailedView = offender.querySelector('a[itemprop="url"]').href;
                const identifier = img.split('/').pop().split('.')[0];  // extract the identifier ex. 00415654
                return { name, img, address, locality, detailedView, identifier };
            });
            return data;
        });
        
        for(const person of results){
            const highQualityImgUrl = `https://www.homefacts.com/images/offenders/tennessee/thumb/${person.identifier}.jpg`;
            // save in current directory
            const imageFilename = path.join(__dirname, `${person.identifier}.jpg`);
            try {
                await downloadImage(highQualityImgUrl, imageFilename);
            } catch {
                console.error('youll get this error despite the images downloading correctly');
            }
            // concatenate with new array (prevents error)
            allResults.push({
                name: person.name,
                img: highQualityImgUrl,  
                address: person.address,
                locality: person.locality
            });
        }

        // write to file after each offender to results.json
        await fsPromises.writeFile(
            'results.json', 
            JSON.stringify(allResults, null, 2)
        );

        pageNum++;
        if(pageNum <= lastPage){
            await page.goto(`https://www.homefacts.com/offenders/Tennessee/Knox-County-${pageNum}.html`, {timeout: 0});
        }

    } 

    // save file
    await fs.writeFile(
        'results.json', 
        JSON.stringify(allResults, null, 2)
    );
    
    console.log(allResults);

    await browser.close();
})();
