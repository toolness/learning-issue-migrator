var path = require('path');

var cacheIssues = require('./cache-issues');

exports.run = function(cb) {
  var issueNumber = parseInt(process.argv[2]);

  if (isNaN(issueNumber)) {
    console.log("usage: " + path.basename(process.argv[1]) + " <issue>");
    process.exit(1);
  }

  var issue = cacheIssues.getCachedIssue(issueNumber);

  cb(issue);
};
