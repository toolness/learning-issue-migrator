var generateMigratedIssue = require('./generate-migrated-issue');

if (!module.parent) {
  require('./issue-cmd').run(function(issue) {
    var newIssue = generateMigratedIssue(issue);

    console.log(newIssue.body);
  });
}
