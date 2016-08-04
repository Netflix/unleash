![Bad Release](https://cloud.githubusercontent.com/assets/77849/16959116/498ef28a-4d98-11e6-8d99-6fb08aa1d1c4.gif)

## Professionally publish your JavaScript modules in one keystroke


### Key Features
* Updates your version according to semantic versioning
* Runs your tests
* Updates your changelog
* Publishes your module to NPM
* Pushes your code and tags to git
* Supports both Github & Stash (creates links to these in your changelog)
* Allows you to preview what files will and won't be published to NPM

### Convince your manager (Why use Unleash?)
* Unleash eats it's own dogfood. Unleash is used to release itself
* Unleash eliminates common time-wasting mistakes such as forgetting to tag your releases (or forgetting to publish your module)
* Unleash encourages use of software conventions such as the CHANGELOG by making it dead easy
* Unleash encourages you to make git commit messages that make sense to everyone in your organization
* Unleash is constructed from battle-tested and well-understood open source modules such as vinyl-fs, yargs, chalk & semver. Additionally, the architecture of Unleash is partially based on Gulp
* Unleash uses the [Angular Conventional Changelog](https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md) manner of using git commit conventions


### CLI Examples
#### Execute a Dry Run of Publishing a Patch Release
```
unleash -p -d
```
OR...
```
unleash --patch --dry-run
```

![](https://raw.githubusercontent.com/jameswomack/unleash/bd4eeedb742dc099a8545879924c270b915deb5b/screens/dry-run.png)

#### Execute a Patch Release
```
unleash -p
```
OR...
```
unleash --patch
```
![](https://raw.githubusercontent.com/jameswomack/unleash/683c4cea7a0ed58d733b51cf20a15bdf9fb563c4/screens/run.png)


#### Execute a Major Release
```
unleash -M
```
OR...
```
unleash --major
```

#### Execute a Minor Release to a Stash Repository
```
unleash -m -r stash
```
OR...
```
unleash --minor --repo-type stash
```

#### View which files will be published to NPM
This can be helpful in ensuring your package is being published with the least
amount of files possible, while also ensuring you have all the files you need.
We use this to eliminate files like .eslintrc and .tern-project.
```
unleash -ls
```
OR...
```
unleash --list-publishables
```

#### Publish your project's documentation to Github Pages
Manually leveraging Github's Pages feature can be tedious. You need to maintain
a branch that's orphaned from master and yet is based on assets and/or tasks
from master. Unleash can help by allowing you to publish files matching a quoted
glob string to gh-pages from the comfort of the branch you normally work on.
```
unleash --gh
# defaults to "./docs/**/*"
```
OR...
```
unleash --ghpages-deploy --ghpages-path "./public/**/*"
```

### Git Commit Convention [Examples](https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md)
```
perf(pencil): remove graphiteWidth option
fix(graphite): stop graphite breaking when width < 0.1
feat(pencil): add 'graphiteWidth' option
```

### Installation

```
# Global w/ latest stable release
npm i unleash -g
```
OR...
```
# Locally saved w/ exact version
npm i unleash -DE
```

### Supported Version Types
* Major **-M** | **--major**
  * E.g. `"2.6.4"` => `"3.0.0"`
* Minor **-m** | **--minor**
  * E.g. `"2.6.4"` => `"2.7.0"`
* Patch **-p** | **--patch**
  * E.g. `"2.6.4"` => `"2.6.5"`
* Prerelease **-P** | **--prerelease**
  * E.g. `"2.6.4-beta.0"` => `"2.6.4-beta.1"`
  
### Badge-o-rama
![Travis badge](https://travis-ci.org/Netflix/unleash.svg)

<img src="https://c2.staticflickr.com/4/3738/11674920374_34acde064b_b.jpg" width="400">

