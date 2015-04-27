This is an attempt at implementing a solution for 
[the great learning issue migration][migration].

## Environment Variables

* `GITHUB_USERNAME` is your GitHub username.
* `GITHUB_PASSWORD` is your GitHub password.

## Quick Start

Run `npm install` to install dependencies.

Run `node cache-issues.js` to cache issues to your local filesystem in
the `cache` directory.

Re-running `node cache-issues.js` will update the cache.

Running `node analyze-issues.js` will provide help on various reports
you can run on the cached issues.

<!-- Links -->

  [migration]: https://github.com/mozilla/teach.webmaker.org/issues/807
