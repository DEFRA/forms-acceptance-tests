# forms-acceptance-tests

The template to create a service that runs WDIO tests against an environment.

- [forms-acceptance-tests](#forms-acceptance-tests)
  - [Local Development](#local-development)
    - [Requirements](#requirements)
      - [Node.js](#nodejs)
    - [Setup](#setup)
    - [Running local tests](#running-local-tests)
    - [Running on GitHub](#running-on-github)
  - [Licence](#licence)
    - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

### Running local tests

Start the Forms test harness by doing the following:

- Clone https://github.com/DEFRA/forms-development-tools
- `cd test-harness`
- `./run-harness.sh`

Once it has started (usually takes around 10 seconds once all Docker images have been downloaded), you can run the acceptance tests in this repository by doing

```bash
npm run test
```

### Running on GitHub

The acceptance tests can be run as a Github workflow.

- Navigate to https://github.com/DEFRA/forms-acceptance-tests/actions/workflows/journey-tests.yml
- Click the 'Run worklfow' button on the top right of the table
- Select the default 'main' branch
- Click 'Run workflow'

This starts the workflow job and the progress can be followed by viewing the log. The workflow usually take about 3 - 4 mins to complete.

Once completed, you can examine the artifacts by navigating into the workflow run. Artifacts are listed at the bottom of the screen. Download the `allure-report`, unzip it, and open `index.html` for the results in a drill-down web page.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
