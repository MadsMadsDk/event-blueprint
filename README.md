# Event Blueprint Styleguide
[![build status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## Prerequisites
* [NodeJS](http://nodejs.org/)
* [GulpJS](http://gulpjs.com/)

## Installation
Clone the repo to a folder, open a command window and run the following command. Requires you to have node installed.
```bash
$ npm install
```

## Conventions
For the styleguide to work correctly, you must structure your template files and sample-data files like so (using handlebars for example):
* src/
  * templates/
    * foo/
      * bar.handlebars
  * sample-data/
    * foo/
      * bar.json

## Usage
This styleguide comes with a couple of commands. It is designed for you to use any library, framework or workflow you'd like to use.
Just edit the gulpfile.js in the root, to accommodate any changes you have.
Be aware not to change the tasks connected to compiling the styleguide though.

### Launching the styleguide
Run the following command
```bash
gulp styleguide
```
This command generates a project.json file from the project information-object inside the project, as well as the directory structure from src/templates.


## Why?
There's a lot of styleguide-frameworks out there, but I haven't come across one that ran on node, and by design is language-agnostic.
Hence this styleguide-app :)

## Roadmap
* I'm planning a lot of features. Will update the list of upcoming features here.

[travis-image]: https://img.shields.io/travis/MadsMadsDk/event-blueprint.svg?style=flat-square
[travis-url]: https://travis-ci.org/MadsMadsDk/event-blueprint
[coveralls-image]: https://coveralls.io/repos/MadsMadsDk/event-blueprint/badge.svg
[coveralls-url]: https://coveralls.io/r/MadsMadsDk/event-blueprint
