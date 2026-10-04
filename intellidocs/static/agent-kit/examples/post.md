How we cut our CI time from 22 minutes to 9

For a year our pull requests waited 22 minutes for CI. Engineers batched changes to avoid the wait,
and reviews got bigger and slower. Last quarter we made three changes.

First, we split the test suite into 6 parallel shards based on past test timings, not file names.
Second, we cached dependencies by lockfile hash, which raised our cache hit rate to 91 percent.
Third, we moved the slow end-to-end tests to a nightly job and kept a small smoke suite on every pull request.

CI now takes 9 minutes at the median. Pull requests got smaller: the median diff dropped from 410 lines
to 260 lines. The nightly job still catches the rare end-to-end break, and the on-call engineer
fixes it before the morning stand-up.
