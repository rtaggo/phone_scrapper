'use strict';

const API_VERSION = '1.0.0';

const program = require('commander');
const fs = require('fs');

console.log(`PHONE SCRAPPER Version ${API_VERSION}`);

program
  .version(API_VERSION)
  .name('phone-scrapper')
  .description('Scrapping de numéro de téléphone')
  .option('-c,--config [config_file]', 'Configuration file', 'config.json')
  .option('-i,--inputfile [inputfile]', 'Input file', 'input.csv')
  .option('-o,--outputfile [outputfile]', 'Output file for phones option', 'phones.csv')
  .option('-s,--sample', 'Display sample config.json')
  .parse(process.argv);

const check_configuration = async (config_path, input_path) => {
  let config_is_ok = true;
  let input_is_ok = true;
  try {
    if (!fs.existsSync(config_path)) {
      console.error(`Configuration file '${config_path} does not exist`);
      config_is_ok = false;
    }
  } catch (error_config) {
    console.error(`Error while checking is configuration file '${config_path}' exists.`);
    console.error(error_config);
  }
  try {
    if (!fs.existsSync(input_path)) {
      console.error(`Input file '${input_path} does not exist`);
      input_is_ok = false;
    }
  } catch (error_input) {
    console.error(`Error while checking is input file '${input_path}' exists.`);
    console.error(error_input);
  }
  return config_is_ok && input_is_ok;
};

const get_configuration_data = async (config_path) => {
  const default_configuration = {
    fields: {
      siret: 'SIRET',
      rs: 'RS',
      enseigne: 'ENSEIGNE',
      address: 'ADRESSE',
      postalcode: 'CP',
      city: 'CITY',
    },
    headerless_browser: 'puppeteer',
  };
  try {
    let config_content = JSON.parse(fs.readFileSync(config_path));
    return { ...default_configuration, ...config_content };
  } catch (err) {
    console.error(`Failed to read configuration file ${config_path}: ${err.message}\n`);
    return null;
  }
};

const main = async () => {
  try {
    let { config, inputfile, outputfile } = program;
    console.log(`Running Phone scrapper with:
    - config : '${config}'
    - input  : '${inputfile}'
    - output : '${outputfile}'
    `);
    config = config.trim();
    inputfile = inputfile.trim();
    outputfile = outputfile.trim();

    const all_is_ok = await check_configuration(config, inputfile);
    if (!all_is_ok) {
      console.error('Stopped: something is not configured correctly');
      return;
    }
    const configuration = await get_configuration_data(config);
    console.log(configuration);
    const { scrap_phones } = require('./lib/phones_scrapper');
    const res = await scrap_phones(configuration, inputfile, outputfile);
    console.log(`Phones Scrapping done. ok? ${res}`);
  } catch (err) {
    console.error(err);
  }
};

main();
