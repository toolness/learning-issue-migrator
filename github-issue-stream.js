var _ = require('underscore');

var PagedEntityStream = require('./paged-entity-stream');

function GithubIssueStream(options) {
  return new PagedEntityStream(_.extend({}, options, {
    url: 'https://api.github.com/repos/' + options.repo +
         '/issues'
  }));
}

module.exports = GithubIssueStream;
