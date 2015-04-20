var GithubIssueStream = require('./github-issue-stream');

var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

var GITHUB_REPO = 'mozilla/teach.webmaker.org';
var USER_AGENT = 'learning-issue-migrator on behalf of ' +
                 'GitHub user ' + GITHUB_USERNAME;

var stream = new GithubIssueStream({
  userAgent: USER_AGENT,
  repo: GITHUB_REPO,
  user: GITHUB_USERNAME,
  pass: GITHUB_PASSWORD
});

stream.on('data', function(issue) {
  console.log(issue.number, issue.title);
});
