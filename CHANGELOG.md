<a name="2.0.2"></a>
### 2.0.2 (2020-04-30)


#### Bug Fixes

* **deploy:** #17 - deploy with node 9 and above ([e80d3b1b](https://github.com/netflix/unleash/commit/e80d3b1b))
* **deps:** security & compat. updates ([2c121787](https://github.com/netflix/unleash/commit/2c121787))


<a name="2.0.1"></a>
### 2.0.1 (2017-11-11)


#### Bug Fixes

* **validation:** nicer multi-version-type msg ([86ace1c7](https://github.com/netflix/unleash/commit/86ace1c7))


<a name="2.0.0"></a>
## 2.0.0 (2017-11-07)


#### Bug Fixes

* git tag pushing is working again
* prepublish scripts are working with the latest npm
* merge on index ([db5224b3](https://github.com/netflix/unleash/commit/db5224b3))
* block scoping < 6 ([93d89f47](https://github.com/netflix/unleash/commit/93d89f47))
* move up version type ([99b840ab](https://github.com/netflix/unleash/commit/99b840ab))
* tag not pushing ([b322f8f4](https://github.com/netflix/unleash/commit/b322f8f4))
* revert on failed publish ([27a54ffc](https://github.com/netflix/unleash/commit/27a54ffc))


#### Features

* `--no-publish` can be used to skip NPM publishing
* `--no-push` can be used to skip git pushing
* `--repo-type stash` has been renamed to bitbucket
* mid-deployment failures are now recovered from/reverted, your own changes are retained
* di for logging ([38fb29dd](https://github.com/netflix/unleash/commit/38fb29dd))


#### Breaking Changes

* stash repo type is now bitbucket

 ([ce0ca760](https://github.com/netflix/unleash/commit/ce0ca760))


<a name="1.6.1"></a>
### 1.6.1 (2017-07-05)


<a name="1.6.0"></a>
## 1.6.0 (2017-07-05)


#### Bug Fixes

* **deps:** gulp-git fix issues with node 8 ([0d091cd2](https://github.com/netflix/unleash/commit/0d091cd2))


<a name="1.5.0"></a>
## 1.5.0 (2016-09-27)


#### Features

* support tagging in monorepos ([e92c6818](https://github.com/netflix/unleash/commit/e92c6818))


<a name="1.4.0"></a>
## 1.4.0 (2016-09-27)


#### Features

* in-publish support ([67dffc72](https://github.com/netflix/unleash/commit/67dffc72))


<a name="1.3.0"></a>
## 1.3.0 (2016-08-03)


#### Features

* Add ghpages-deploy command ([4927b03c](https://github.com/netflix/unleash/commit/4927b03c))
* **ghpages:** Init ([f3d3d954](https://github.com/netflix/unleash/commit/f3d3d954))


<a name="1.2.6"></a>
### 1.2.6 (2016-07-19)


#### Bug Fixes

* **cli:** Change repoType to repo-type ([3cf4faa0](https://github.com/jameswomack/unleash/commit/3cf4faa0))


<a name="1.2.3"></a>
### 1.2.3 (2016-07-19)


<a name="1.2.2"></a>
### 1.2.2 (2016-05-13)


<a name="1.2.1"></a>
### 1.2.1 (2016-05-13)


<a name="1.2.0"></a>
## 1.2.0 (2016-05-13)


#### Features

* **cli:**
  * List files to be published ([c5097914](https://github.com/jameswomack/unleash/commit/c5097914))
  * Initialize the Unleash CLI ([286b2f3c](https://github.com/jameswomack/unleash/commit/286b2f3c))


<a name="1.1.2"></a>
### 1.1.2 (2016-04-07)


#### Bug Fixes

* **semver:** Fix pkg path issue ([b4c96c70](https://github.com/jameswomack/unleash/commit/b4c96c70))


<a name="1.1.1"></a>
### 1.1.1 (2016-03-07)


#### Bug Fixes

* **CHANGELOG:** Use Netflix fork of CCL ([bd4eeedb](https://github.com/jameswomack/unleash/commit/bd4eeedb))


<a name="1.1.0"></a>
## 1.1.0 (2015-10-22)


#### Bug Fixes

* **dryrun:**
  * Initialize isDryRun with yargs ([5b990595](https://github.com/jameswomack/unleash/commit/5b990595))
  * Prevent filestream from executing ([d16baf1a](https://github.com/jameswomack/unleash/commit/d16baf1a))


#### Features

* **cli:** Add header ([cc3f1fd3](https://github.com/jameswomack/unleash/commit/cc3f1fd3))


<a name="1.0.9"></a>
### 1.0.9 (2015-10-22)


<a name="1.0.8"></a>
### 1.0.8 (2015-10-22)


<a name="1.0.7"></a>
### 1.0.7 (2015-10-22)


<a name="1.0.6"></a>
### 1.0.6 (2015-10-22)


#### Features

* **cli:** Initialize the Unleash CLI ([286b2f3c](https://github.com/jameswomack/unleash/commit/286b2f3c))

