<img src="https://raw.githubusercontent.com/toolness/learning-issue-migrator/master/img/migration.png">

This is an attempt at implementing a solution for 
[The Great Learning Issue Migration][migration]. Here's what it looks
like when it's running:

<img src="https://raw.githubusercontent.com/toolness/learning-issue-migrator/master/img/screenshot.jpg">

## Environment Variables

* `GITHUB_USERNAME` is your GitHub username.
* `GITHUB_PASSWORD` is your GitHub password.
* `GITHUB_DEST_REPO` is the destination repository to migrate issues
  to, e.g. `mozilla/mozilla-learning`.
* `MIGRATION_DELAY_SECONDS` is the amount of seconds to wait before
  migrating each issue (only valid when migrating multiple issues).
  Defaults to 5. Required to avoid [abuse rate limits][abuse].

## Quick Start

Run `npm install` to install dependencies.

Run `node cache-issues.js` to cache issues to your local filesystem in
the `cache` directory.

Re-running `node cache-issues.js` will update the cache.

Running `node analyze-issues.js` will provide help on various reports
you can run on the cached issues.

Running `node milestones.js` will duplicate the source repo's
milestones in the destination repo.

Running `node migrate-issue.js` will migrate an individual issue from
the source repo to the destination repo.

Running `node migrate-non-platform-issues.js` will migrate all
non-platform issues that haven't yet been migrated.

<!-- Links -->

  [migration]: https://github.com/mozilla/teach.webmaker.org/issues/807
  [abuse]: https://developer.github.com/v3/#abuse-rate-limits
