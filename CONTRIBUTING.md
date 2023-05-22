# Contributing to Teamwork Time Report


Welcome to Teamwork Time Report, thank you for investing your time in contributing to our project! Below are the guidelines to help you understand how to contribute to this project. Please checkout our [README](README.md) file to become acquainted with this project.


### Table of Contents
* [Code of Conduct](#code-of-conduct)
* [Requirements](#requirements)
* [Creating an Issue](#creating-an-issue)
* [Set up repository locally](#set-up-the-repository-locally)
* [Submitting a Pull Request](#submitting-a-pull-request)



## Code of Conduct
Please note that this project has adopted a Code of Conduct, and by participating in this project you agree to abide by its terms. Please find the full contents of the Code of Conduct by [clicking here](CODE_OF_CONDUCT.md).



## Creating an Issue ✏️
1. Please be sure there is not an open issue in the [Issues Section](https://github.com/clarity-innovations/ci-teamwork/issues) of the repository you are working on.
2. If this is a bug, please include the steps necessary to reproduce the issue, and create a reproducible test case and include it in a .md file within the pull request titled ```BUG_FIX.md```.
3. For feature requests, please share a description of the new feature, why the new feature improves the project, and how you would implement it.
4. Please share links to the corresponding GitHub documentation.



Please follow the steps below:
1. Fork the repository
2. Clone the fork to your local machine.
* _Replace <your account name> with the name of the account you forked to and <repository name> with the repository name you forked._
```shell
 git clone https://github.com/<your account name>/<repository name>.git
  cd <repository name>
 npm install
 ```
3. Build the project to make sure the local setup is work as expected
```shell
 npm build
 ```
4. Run the project
```shell
 npm run start
 ```



## Submitting a Pull Request 🚀
1. Create a new local branch
* _Replace <branch name> with your new branches name._
 ```shell
  git branch <branch name>
 ```
2. Make changes in your branch and push them to your fork with detailed commit messages.
3. Submit a pull request from your branch to the master branch on the [ci-teamwork](https://github.com/clarity-innovations/ci-teamwork) repository.
* _Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request._


---
