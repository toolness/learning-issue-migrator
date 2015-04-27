var readline = require('readline');
var chalk = require('chalk');

var chalkUtil = require('./chalk-util');
var githubRequest = require('./github-request');
var migrate = require('./migrate');
var cacheIssues = require('./cache-issues');
var milestones = require('./milestones');
var generateMigratedIssue = require('./generate-migrated-issue');

function editIssue(number, changes, dest, cb) {
  githubRequest({
    method: 'PATCH',
    url: 'https://api.github.com/repos/' + dest + '/issues/' + number,
    json: true,
    body: changes
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode != 200)
      return cb(new Error("got HTTP " + res.statusCode));
    cb(null, body);
  });
}

function createIssue(newIssue, dest, cb) {
  githubRequest({
    method: 'POST',
    url: 'https://api.github.com/repos/' + dest + '/issues',
    json: true,
    body: newIssue
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode != 201)
      return cb(new Error("got HTTP " + res.statusCode));
    cb(null, body);
  });
}

function main() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  var src = cacheIssues.GITHUB_REPO;
  var dest = migrate.GITHUB_DEST_REPO;

  migrate.verifyConfig();

  require('./issue-cmd').run(function(issue) {
    milestones.createMilestoneMap(src, dest, function(err, map) {
      if (err) throw err;

      var newIssue = generateMigratedIssue(issue, map);

      console.log("Ready to migrate issue " + chalkUtil.issueDesc(issue) +
                  ".");
      rl.question("Press enter to migrate or CTRL-C to abort.", function() {
        rl.close();

        console.log("Creating new issue in " + chalk.cyan(dest) + "...");
        createIssue(newIssue, dest, function(err, createdIssue) {
          if (err) throw err;

          console.log("Created " + chalkUtil.issueDesc(createdIssue) + ".");

          if (issue.state === 'closed') {
            editIssue(createdIssue.number, {
              state: 'closed'
            }, dest, function(err, closedIssue) {
              if (err) throw err;
              console.log("Closed " + chalkUtil.issueDesc(closedIssue) +
                          ".");
            });
          }
        });
      });
    });
  });
}

if (!module.parent) {
  main();
}
