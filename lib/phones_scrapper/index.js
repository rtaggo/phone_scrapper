const { sleep } = require('../../utils/tools.js');

const SLEEP_DELAY = 150;

const get_name = (record, configuration) => {
  if (record[configuration.fields.enseigne]) {
    return record[configuration.fields.enseigne];
  }
  if (record[configuration.fields.rs]) {
    return record[configuration.fields.rs];
  }
  return 'inconnu';
};

const get_address = (record, configuration) => {
  let address = [];
  if (record[configuration.fields.address]) {
    address.push(record[configuration.fields.address]);
  }
  if (record[configuration.fields.postalcode]) {
    address.push(record[configuration.fields.postalcode]);
  }
  if (record[configuration.fields.city]) {
    address.push(record[configuration.fields.city]);
  }
  return address.join(' ');
};

exports.scrap_phones = async (configuration, input_file, output_file) => {
  const cliProgress = require('cli-progress');
  const csv = require('csvtojson');
  const error_file_path = `${output_file.split('.')[0]}_errors.csv`;
  const fs = require('fs');
  const { get_phones_google, close_browser } = require('../google');

  const b1 = new cliProgress.SingleBar(
    {
      format: 'Phone Scrapper progress |{bar}| {percentage}% | {value}/{total}',
      /*
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      */
      hideCursor: true,
    },
    cliProgress.Presets.shades_grey
  );
  let nb_phones_found = 0;
  let nb_to_fetch = 0;
  try {
    let json_data = await csv({
      delimiter: ';',
    }).fromFile(input_file);
    /* for dev only: uncomment to get the 10 first rows 
    json_data = json_data.slice(0, 10);
    */
    if (typeof configuration.limit !== 'undefined' && configuration.limit > 0) {
      json_data = json_data.slice(0, configuration.limit);
    }
    nb_to_fetch = json_data.length;
    console.log(`Nb lignes à traiter: ${nb_to_fetch}`);
    // initialize the bar - defining payload token "speed" with the default value "N/A"
    b1.start(json_data.length, 0, {
      speed: 'N/A',
    });
    let records_map = json_data.reduce(
      (a, b) => (
        (a[b[configuration.fields.siret]] = {
          siret: b[configuration.fields.siret],
          address: get_address(b, configuration),
          name: get_name(b, configuration),
        }),
        a
      ),
      {}
    );
    const sirets = Object.keys(records_map);
    const csv_header = `${configuration.fields.siret};${configuration.fields.rs};${configuration.fields.enseigne};${configuration.fields.address};${configuration.fields.postalcode};${configuration.fields.city};${configuration.fields.phone};SCRAPPED_TEL\n`;
    fs.writeFileSync(output_file, csv_header);
    fs.writeFileSync(error_file_path, 'siret;error\n');
    let nb_max_phones = 0;
    for (let i = 0; i < sirets.length; i++) {
      await sleep(SLEEP_DELAY);
      const siret = sirets[i];
      let rec_info = json_data.find((r) => r[configuration.fields.siret] === siret);
      let record = records_map[siret];
      const search_query = `${record.name.replace(/ /g, '+')}+${record.address.replace(/ /g, '+')}`;
      let csv_row = `${rec_info[configuration.fields.siret]};${rec_info[configuration.fields.rs]}`;
      if (rec_info[configuration.fields.enseigne]) {
        csv_row += `;${rec_info[configuration.fields.enseigne]}`;
      } else {
        csv_row += ';';
      }
      if (rec_info[configuration.fields.address]) {
        csv_row += `;${rec_info[configuration.fields.address]}`;
      } else {
        csv_row += ';';
      }
      if (rec_info[configuration.fields.postalcode]) {
        csv_row += `;${rec_info[configuration.fields.postalcode]}`;
      } else {
        csv_row += ';';
      }
      if (rec_info[configuration.fields.city]) {
        csv_row += `;${rec_info[configuration.fields.city]}`;
      } else {
        csv_row += ';';
      }
      if (rec_info[configuration.fields.phone]) {
        csv_row += `;${rec_info[configuration.fields.phone]}`;
      } else {
        csv_row += ';';
      }

      let res = null;
      try {
        res = await get_phones_google(search_query);
        //console.log('\n' + JSON.stringify(res) + ' res.phones.length = ' + res.phones.length);
        if (res && res.phones) {
          if (Array.isArray(res.phones) && res.phones.length > 0) {
            csv_row += `;${res.phones[0]}`;
            nb_phones_found++;
          } else if (typeof res.phones === 'string') {
            csv_row += `;${res.phones}`;
            nb_phones_found++;
          } else {
            //process.stdout.write('\t aucun résultat\n');
            csv_row += ';';
          }
        } else {
          //process.stdout.write('\t aucun résultat\n');
          csv_row += ';';
          if (res.error) {
            fs.appendFileSync(error_file_path, `${rec_info[configuration.fields.siret]};${res.q}\n`);
          }
        }
      } catch (error_scrap) {
        console.error(`Scrapping phones error for ${rec_info[configuration.fields.siret]}: ${JSON.stringify(error_scrap)}`);
        fs.appendFileSync(error_file_path, `${rec_info[configuration.fields.siret]};"${JSON.stringify(error_scrap)}"\n`);
        //console.error(err);
      }

      fs.appendFileSync(output_file, csv_row + '\n');
      b1.increment();
    }
    await close_browser();
  } catch (err) {
    console.error(`Scrapping phones error: ${JSON.stringify(err)}`);
  }
  b1.stop();
  console.log(`Found ${nb_phones_found} on ${nb_to_fetch}`);
  return true;
};
