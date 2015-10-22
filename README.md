# Unleash

## Unleash your code—without having another bad release

![Bad Release](https://c1.staticflickr.com/3/2355/2417329091_b31158ce8c.jpg)

**Unleash** handles the tedious details of publishing NPM modules. It assists you by updating version number, making sure the tests run, updating your changelog et al. More specifically it aims to be the **dead easiest** code releaser for Node.js. Little to no configuration should be needed, in contrast to other tools.

As a release is pushed, it gets tagged in your git repository as well. Links to each published commit will be present in the produced changelog. Github and Stash URL formats are supported.

Unleash always works with commits instead of files in your working copy to ensure your release are fully committed. In fact, the linchpin of Unleash is the [Angular Conventional Changelog](https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md) manner of using git commit conventions that improve both your git history and your ability to have an automated changelog. 

### CLI Examples
#### Execute a Dry Run of Publishing a Patch Release
```
unleash -p -d
```
#### Execute a Major Release
```
unleash -M
```
#### Execute a Minor Release to a Stash Repository
```
unleash -m -r stash
```

### Git Commit Convention [Examples]((https://github.com/ajoslin/conventional-changelog/blob/9c359faacea93b566f19c4c7214a6bca58edf99f/conventions/angular.md)
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