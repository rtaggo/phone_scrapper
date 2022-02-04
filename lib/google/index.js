const path = require('path');
const puppeteer = require('puppeteer');
const Nightmare = require('nightmare');
const isPkg = typeof process.pkg !== 'undefined';
//mac path replace
let chromiumExecutablePath = isPkg
  ? puppeteer.executablePath().replace(/^.*?\/node_modules\/puppeteer\/\.local-chromium/, path.join(path.dirname(process.execPath), 'chromium'))
  : puppeteer.executablePath();

console.log(process.platform);
console.log(__dirname);
console.log(path.dirname(process.execPath));
if (process.platform === 'linux') {
  chromiumExecutablePath = path.resolve(__dirname, '../../node_modules/puppeteer/.local-chromium/linux-818858/chrome-linux/chrome');
} else {
  //check win32
  if (process.platform === 'win32') {
    chromiumExecutablePath = isPkg
      ? puppeteer.executablePath().replace(/^.*?\\node_modules\\puppeteer\\\.local-chromium/, path.join(path.dirname(process.execPath), 'chromium'))
      : puppeteer.executablePath();
  }
}
console.log(`chromiumExecutablePath: ${chromiumExecutablePath}`);
const _get_browser = async () => {
  const browser = await puppeteer.launch({
    executablePath: chromiumExecutablePath,
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
    ],
  });
  return browser;
};

exports.get_phones_google = async (search_query) => {
  let searchResults = null;
  const browser = await _get_browser();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const requestType = request.resourceType();
    if (requestType === 'image' || requestType === 'stylesheet' || requestType === 'script') {
      return request.abort();
    } else {
      return request.continue();
    }
  });
  /* 
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') request.abort();
      else request.continue();
    });
    */
  const g_uri = `https://www.google.com/search?q=${search_query}`;
  //console.log(`let navigate to ${g_uri}`);
  const phone_selector = 'div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]';
  try {
    await page.goto(g_uri, { waitUntil: 'networkidle2' });
    //await page.waitForSelector(phone_selector);
    const phone_number = null;
    /*
    try {
      phone_number = await page.$eval('div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] span[class="LrzXr zdqRlf kno-fv]', (el) => el.innerText);
      console.log(`phone_number = ${phone_number}`);
    } catch (err) {}
    */
    let t_res = await page.$$eval('div[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]', (results) => {
      console.log(results);
      let data = [];
      results.forEach((parent) => {
        let phone = parent.querySelector('span[class="LrzXr zdqRlf kno-fv"]');
        data.push(phone.innerText);
      });
      return data;
    });
    searchResults = { q: g_uri, phones: t_res };
    //return { q: g_uri, phones: phone_number };
  } catch (err) {
    console.error(err);
  }
  await browser.close();
  return searchResults;
};

exports.close_browser = async () => {
  try {
    await browser.close();
    //console.log('Browser closed');
  } catch (err) {
    //console.log('Failed to close Browser', err);
  }
  return true;
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
