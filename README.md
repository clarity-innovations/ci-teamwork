# Teamwork Time Report

## Introduction

[Teamwork](https://www.teamwork.com/product/) is a hosted project management tool. Its built-in reporting only presents time-log data in a flat format, which makes it difficult to use for post-project time analysis. The `Teamwork Time Report` allows you to create a hierarchical project time data report that shows individual and aggregate task time, and allows for filtering by date, keyword, or hours logged.

## About the API We Use

This application makes use of version 1 of the Teamwork API. To use this application, you will need an active Teamwork account with API access and a valid API token. For more information on Teamwork's API, please see their [Developer Documentation](https://developer.teamwork.com/).


## Set up & Requirements 

* Clone repository to your desktop:

  * ✔️ GIT must be installed to clone the repository. [Install Git](https://docs.github.com/en/get-started/quickstart/set-up-git) if you haven't already.
  
  * ✔️ Node.js is also required. [Install Node.js](https://nodejs.org/en/) if you haven't already.
  
  1. Using your terminal, navigate to your desired landing folder.
  1. Open your terminal and run the following command:
     ```shell 
     git clone https://github.com/clarity-innovations/ci-teamwork.git
     ```
  1. After the cloning process is complete change directories to the project:
     ```shell
     cd ci-teamwork
     ```
  1. Install dependencies:
     ```shell
     npm ci
     ```
  1. Run the program:
     ```shell
     npm run start
     ```
  1. Open [http://localhost:3000](http://localhost:3000) to view the project in your browser.

___

## Finding API Token, Project ID, Company Name
Teamwork Time Report requires the use of a Project ID and a Teamwork API Token. Follow these steps to find your Project ID and API token:

#### API Token 🗝️
1. Log in to your Teamwork account and navigate to your profile.
1. Once on your profile click the button labeled "Edit My Profile".
1. Select "API & Mobile" from the pop-up menu.
1. Click "Show Your Token" to reveal your API Token.
1. Copy your API Token to your clipboard.
1. Open [http://localhost:3000](http://localhost:3000) where Teamwork Time Report is running and paste your API token in the "API Key" field.

#### Project ID 🔎
1. Within Teamwork, navigate to the Teamwork project that you want to use with Teamwork Time Report.
1. From the URL in your web browser, find the number after "/project/". This is your Project ID.
1. Copy the number to your clipboard.
1. Open [http://localhost:3000](http://localhost:3000) where Teamwork Time Report is running and paste the Project ID in the "Project ID" field.

#### Company Name 🌐 
1. Within Teamwork, from the URL in your web browser, find the name associated with your company: 
   * `https://<your company>.teammwork.com`
   * `<your company>` is your company name.
   * Copy this name to your clipboard.
1. Open [http://localhost:3000](http://localhost:3000) where Teamwork Time Report is running and paste the company name in the "Company Name" field.


## How To Use The Application
* If the application isn't already running, please run the application with the following command:
  ```shell
  npm run start
  ```
* Insert the Project ID and API Key then click the "Search" button.
* After the website has been populated with data from your Teamwork project, you will be able to click through parent tasks and child subtasks.
* Hours for tasks and subtasks are displayed within the Total and Task columns.
* Tasks and subtasks can be filtered by date, keyword, and task hours.


## Contributing
Please read [the guidelines for contributing](CONTRIBUTING.md) for more details on the process for submitting pull requests. This project is goverend by a [Code of Conduct](CODE_OF_CONDUCT.md).

## Authors
* **Marc Sandoval** - *Creator of the original version*
* **Bodie Wood** - *Fixed, updated, added new features* 
* **Brandon Fenk** - *Fixed, updated, added new features* 
* **Kim Robinson** - *Fixed, updated, added new features*
* **Elena Rosa** - *Fixed, updated, added new features*
* **Maya Maier** - *Fixed, updated, added new features*



## License
This project is licensed under the [MIT License](LICENSE.md).


