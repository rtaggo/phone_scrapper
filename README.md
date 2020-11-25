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

# Utilisation

        $ node index -c [path_to_config_file] -i [path_to_input_file] -o [path_to_output_file]
