var chalk = require('chalk');

var GITHUB_DEST_REPO = process.env.GITHUB_DEST_REPO;

exports.GITHUB_DEST_REPO = GITHUB_DEST_REPO;

exports.verifyConfig = function() {
  if (!GITHUB_DEST_REPO) {
    console.log(chalk.red.bold("Please define GITHUB_DEST_REPO in " +
                               "your environment."));
    process.exit(1);
  }
};
