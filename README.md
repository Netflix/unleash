# Unleash

## Professionally publish your JavaScript modules in one keystroke

![Bad Release](https://c1.staticflickr.com/3/2355/2417329091_b31158ce8c.jpg)


### Key Features
* Updates your version according to semantic versioning
* Runs your tests
* Updates your changelog
* Publishes your module to NPM
* Pushes your code and tags to git
* Supports both Github & Stash (creates links to these in your changelog)
* Allows you to preview what files will and won't be published to NPM

### Convince your manager (Why use Unleash?)
* Unleash eats it's own dogfood. Unleash is used to release itself.
* Unleash eliminates common time-wasting mistakes such as forgetting to tag your releases (or forgetting to publish your module)
* Unleash encourages use of software conventions such as the CHANGELOG by making it dead easy
* Unleash encourages you to make git commit messages that make sense to everyone in your organization
* Unleash is constructed from battle-tested and well-understood open source modules such as vinyl-fs, yargs, chalk & semver. Additionally, the architecture of Unleash is partially based on Gulp.
* Unleash uses the [Angular Conventional Changelog](https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md) manner of using git commit conventions 


### CLI Examples
#### Execute a Dry Run of Publishing a Patch Release
```
unleash -p -d
```

![](https://raw.githubusercontent.com/jameswomack/unleash/bd4eeedb742dc099a8545879924c270b915deb5b/screens/dry-run.png)

#### Execute a Patch Release
```
unleash -p
```
![](https://raw.githubusercontent.com/jameswomack/unleash/683c4cea7a0ed58d733b51cf20a15bdf9fb563c4/screens/run.png)


#### Execute a Major Release
```
unleash -M
```

#### Execute a Minor Release to a Stash Repository
```
unleash -m -r stash
```

### Git Commit Convention [Examples](https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md)
```
perf(pencil): remove graphiteWidth option
fix(graphite): stop graphite breaking when width < 0.1
feat(pencil): add 'graphiteWidth' option
```

### Installation

```
npm i unleash -g
```
OR...
```
npm i unleash -DE
```

### Supported Version Types
* Major **-M**
* Minor **-m**
* Patch **-p**
* Prerelease **-P**

<img src="https://c2.staticflickr.com/4/3738/11674920374_34acde064b_b.jpg" width="400">

### Next Steps
* Tech blog post draft
* Talk with Ben about standardization of Angular release convention. Where will this spec be communicated? What is a tool for validating against this spec? (https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit)
* Integrate logo from 99 Designs, color scheme and better marketing language in this document
* Add pertinent badges such as build status
* Introduce "In the Wild" section

### Roadmap
* Make option flags clearer
* Improve dry run by showing a pretty diff of changes that'd occur, including actual file contents
* Get legal review
* Guess which type of release should happen based on commit messages
* Check for outdated & unused dependencies
* Check health of project against bithound
* Look into supporting multi-module releases e.g. Lodash, Babel, React
