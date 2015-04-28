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
    if (res.statusCode != 201) {
      console.log(chalk.red.bold("Failed to create issue: " +
                                 JSON.stringify(body, null, 2)));
      return cb(new Error("got HTTP " + res.statusCode));
    }
    cb(null, body);
  });
}

function linkToMigration(src, srcIssue, destIssue, cb) {
  var body = [
    '<a href="' + destIssue.html_url + '"><img src="https://raw.githubusercontent.com/toolness/learning-issue-migrator/master/img/migrated.png"></a>',
    "This issue has been moved to " + destIssue.html_url + ".",
    "Please don't comment on it here."
  ].join('\n');
  githubRequest({
    method: 'POST',
    url: 'https://api.github.com/repos/' + src + '/issues/' +
         srcIssue.number + '/comments',
    json: true,
    body: {
      body: body
    }
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode != 201) {
      console.log(chalk.red.bold("Failed to create comment: " +
                                 JSON.stringify(body, null, 2)));
      return cb(new Error("got HTTP " + res.statusCode));
    }
    cb(null, body);
  });
}

function migrateIssue(options, cb) {
  var rl = options.readline;
  var src = options.src;
  var dest = options.dest;
  var map = options.milestoneMap;
  var issue = options.issue;
  var newIssue = generateMigratedIssue(issue, map);

  console.log("Ready to migrate issue " + chalkUtil.issueDesc(issue) +
              ".");
  rl.question("Press enter to migrate or CTRL-C to abort.", function() {
    rl.close();

    console.log("Creating new issue in " + chalk.cyan(dest) + "...");
    createIssue(newIssue, dest, function(err, createdIssue) {
      if (err) return cb(err);

      console.log("Created " + chalkUtil.issueDesc(createdIssue) + ".");

      editIssue(createdIssue.number, {
        state: issue.state
      }, dest, function(err, createdIssue) {
        if (err) return cb(err);
        console.log("Updated state for new " +
                    chalkUtil.issueDesc(createdIssue) + ".");
        linkToMigration(src, issue, createdIssue, function(err) {
          if (err) return cb(err);
          console.log("Linked to new issue from old issue.");
          editIssue(issue.number, {
            state: 'closed'
          }, src, function(err, issue) {
            if (err) return cb(err);
            console.log("Closed old " +
                        chalkUtil.issueDesc(issue) + ".");
            cb(null, createdIssue);
          });
        });
      });
    });
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

      migrateIssue({
        readline: rl,
        src: src,
        dest: dest,
        milestoneMap: map,
        issue: issue
      }, function(err) {
        if (err) throw err;
        console.log("Done migrating issue.");
      });
    });
  });
}

module.exports = migrateIssue;

if (!module.parent) {
  main();
}
