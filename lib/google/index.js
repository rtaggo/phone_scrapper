const path = require('path');
const puppeteer = require('puppeteer');
const Nightmare = require('nightmare');
const isPkg = typeof process.pkg !== 'undefined';
//mac path replace
let chromiumExecutablePath = isPkg
  ? puppeteer.executablePath().replace(/^.*?\/node_modules\/puppeteer\/\.local-chromium/, path.join(path.dirname(process.execPath), 'chromium'))
  : puppeteer.executablePath();

//console.log(process.platform);
//check win32
if (process.platform == 'win32') {
  chromiumExecutablePath = isPkg
    ? puppeteer.executablePath().replace(/^.*?\\node_modules\\puppeteer\\\.local-chromium/, path.join(path.dirname(process.execPath), 'chromium'))
    : puppeteer.executablePath();
}
exports.get_phones_google = async (search_query) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromiumExecutablePath,
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') request.abort();
      else request.continue();
    });
    const g_uri = `https://www.google.com/search?q=${search_query}`;
    //console.log(`let navigate to ${g_uri}`);
    await page.goto(g_uri, { waitUntil: 'networkidle2' });
    let searchResults = await page.$$eval('div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]', (results) => {
      console.log(results);
      let data = [];
      results.forEach((parent) => {
        let phone = parent.querySelector('span[class="LrzXr zdqRlf kno-fv"]');
        data.push(phone.innerText);
      });
      return data;
    });
    await browser.close();
    return { q: g_uri, phones: searchResults };
  } catch (err) {
    console.error(err);
  }
  return null;
};

exports.get_phones_google_nightmare = async (search_query) => {
  const nightmare = Nightmare({ show: false, loadTimeout: 45 * 1000, waitTimeout: 5 * 1000 });
  const main_selector = 'div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]';
  try {
    const g_uri = `https://www.google.com/search?q=${search_query}`;
    let res = await nightmare
      .goto(g_uri)
      .exists(main_selector)
      .then((elt_exists) => {
        if (elt_exists) {
          console.log('Main Selector exists');
          return nightmare
            .wait(main_selector)
            .evaluate(() => {
              const phone_selector = 'div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] span[class="LrzXr zdqRlf kno-fv"]';
              return document.querySelector(phone_selector).innerText;
            })
            .then((phone) => {
              //console.log(phone);
              return phone;
            })
            .catch((error) => {
              console.error('Search failed:', error);
              return null;
            });
        } else {
          console.log('Main Selector does not exist');
          return null;
        }
      })
      .catch((error) => {
        console.error('Search failed:', error);
        return null;
      });
    await nightmare.end();
    return { phones: res };
  } catch (err) {
    await nightmare.end();
    console.error(err);
  } finally {
    console.log('finally');
    //await nightmare.end();
    await nightmare.end();
    //return null;
  }
  return null;
};
