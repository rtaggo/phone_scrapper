# phone_scrapper

Scrapper de numéro de téléphone

# Installation

## Pré requis

1. Installer GIT
1. Installer NodeJS 10

### Installation de GIT (Ubunt 18.04)

```sh
  $ sudo apt install git
  ...
  $ git --version
  git version 2.17.1
```

### Installation de NodeJS 10 (Ubuntu 18.04)

```sh
  $ sudo apt install curl
  ...
  $ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
  ...
  $ sudo apt install nodejs
  ...
  $ node --version
  v10.23.0
  $ npm --version
  6.14.8
```

# Installation du Phone Scrapper

1.  Clone du project

        $ git clone https://github.com/rtaggo/phone_scrapper.git
        ...
        $ cd phone_scrapper

1.  Installation des dépendances

        $ npm install
        ...

1.  Création de l'exécutable

    1.  changement des permissions

            $ chmod +x index.js

    1.  Création du lien

            $ sudo npm link

    1.  Test

            $ phone_scrapper -h
            PHONE SCRAPPER Version 1.0.0
            Usage: phone-scrapper [options]

            Scrapping de numéro de téléphone

            Options:
              -V, --version                 output the version number
              -c,--config [config_file]     Configuration file (default: "config.json")
              -i,--inputfile [inputfile]    Input file (default: "input.csv")
              -o,--outputfile [outputfile]  Output file for phones option (default: "phones.csv")
              -s,--sample                   Display sample config.json
              -h, --help                    display help for command

# Utilisation

        $ phone_scrapper -c [path_to_config_file] -i [path_to_input_file] -o [path_to_output_file]

# Notes for Ubuntu

```sh
$ uname -a
Linux ns338956 4.15.0-159-generic #167-Ubuntu SMP Tue Sep 21 08:55:05 UTC 2021 x86_64 x86_64 x86_64 GNU/
```

```sh
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description: Ubuntu 18.04.5 LTS
Release: 18.04
Codename: bionic
```

```sh
sudo apt-get update
sudo apt-get install -y libnss3 libatk1.0  libatk-bridge-2.0
sudo apt-get install gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

sudo apt-get install -y libgbm-dev
```
