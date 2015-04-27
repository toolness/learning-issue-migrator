var _ = require('underscore');
var request = require('request');

var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;
var USER_AGENT = 'learning-issue-migrator on behalf of ' +
                 'GitHub user ' + GITHUB_USERNAME;

module.exports = function(options, cb) {
  return request(_.extend({
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': USER_AGENT
    },
    auth: {
      user: GITHUB_USERNAME,
      pass: GITHUB_PASSWORD
    }
  }, options), cb);
};
