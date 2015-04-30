var _ = require('underscore');
var async = require('async');
var chalk = require('chalk');

var cacheIssues = require('./cache-issues');
var isNonPlatformIssue = require('./analyze-issues').isNonPlatformIssue;
var issueDesc = require('./chalk-util').issueDesc;
var migrate = require('./migrate');
var migrateIssue = require('./migrate-issue');
var milestones = require('./milestones');

var MIGRATION_DELAY_SECONDS = process.env.MIGRATION_DELAY_SECONDS || 5;

var fakeReadline = {
  question: function(text, cb) {
    console.log(chalk.yellow.bold(
      "Commencing migration in " + MIGRATION_DELAY_SECONDS +
      " seconds, press CTRL-C to abort."
    ));
    setTimeout(cb, MIGRATION_DELAY_SECONDS * 1000);
  },
  close: function() {}
};

function isNotMigrated(issue) {
  var isMigrated = (issue.title.indexOf('[MIGRATED]') === 0);

  if (isMigrated) {
    console.log(chalk.green("Already migrated ") + issueDesc(issue) + ".");
  }

  return !isMigrated;
}

function main() {
  var src = cacheIssues.GITHUB_REPO;
  var dest = migrate.GITHUB_DEST_REPO;
  var migrations;

  migrate.verifyConfig();

  milestones.createMilestoneMap(src, dest, function(err, map) {
    if (err) throw err;

    migrations = cacheIssues.getAllCachedIssues()
      .filter(isNonPlatformIssue)
      .filter(isNotMigrated)
      .map(function(issue) {
        return migrateIssue.bind(null, {
          readline: fakeReadline,
          src: src,
          dest: dest,
          milestoneMap: map,
          issue: issue
        });
      });

    async.series(migrations, function(err) {
      if (err) throw err;
      console.log("Migrations complete.");
    });
  });
}

if (!module.parent) {
  main();
}
