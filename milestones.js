var _ = require('underscore')
var async = require('async');
var chalk = require('chalk');

var githubRequest = require('./github-request');
var cacheIssues = require('./cache-issues');
var PagedEntityStream = require('./paged-entity-stream');
var migrate = require('./migrate');

function fetchMilestones(repo, cb) {
  var milestones = [];
  var stream = new PagedEntityStream({
    url: 'https://api.github.com/repos/' + repo + '/milestones'
  }).on('data', function(milestone) {
    milestones.push(milestone);
  }).on('error', function(err) {
    cb(err);
  }).on('end', function() {
    cb(null, milestones);
  });
}

function migrateMilestone(milestone, dest, cb) {
  console.log("Creating milestone " +
              chalk.white.bold(milestone.title) + ".");

  githubRequest({
    method: 'POST',
    url: 'https://api.github.com/repos/' + dest + '/milestones',
    json: true,
    body: _.pick(milestone, 'title', 'state', 'description', 'due_on')
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode != 201)
      return cb(new Error("got HTTP " + res.statusCode));
    cb(null);
  });
}

function main() {
  var src = cacheIssues.GITHUB_REPO;
  var dest = migrate.GITHUB_DEST_REPO;

  migrate.verifyConfig();

  console.log("Fetching milestones for " + chalk.cyan(src) + ".");
  fetchMilestones(src, function(err, srcMilestones) {
    if (err) throw err;

    console.log("Fetching milestones for " + chalk.cyan(dest) + ".");
    fetchMilestones(dest, function(err, destMilestones) {
      if (err) throw err;

      var toMigrate = [];

      srcMilestones.forEach(function(srcMilestone) {
        var destMilestone = _.findWhere(destMilestones, {
          title: srcMilestone.title
        });

        if (!destMilestone) {
          toMigrate.push(migrateMilestone.bind(null, srcMilestone, dest));
        }
      });

      async.series(toMigrate, function(err) {
        if (err) throw err;
        console.log("Done migrating milestones.");
      });
    });
  });
}

if (!module.parent) {
  main();
}
