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

#### View which files will be published
```
unleash -ls
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

