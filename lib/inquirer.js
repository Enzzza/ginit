const moment = require("moment");
const momentPlugin = require("moment-precise-range-plugin");
const inquirer = require("inquirer");
const files = require('./files');

const getChoices = () =>{
  let choices = ['personal access token'];
  let timeOfDeprecation = moment("2020-09-30 07:00:00");
  
  if(!(moment().isSame(timeOfDeprecation,"day"))){
    choices.unshift('basic');
  }
  
  return choices;

}

module.exports = {

  askMethodForAuth: () => {
    
    return inquirer.prompt({
      name: "methodForAuth",
      type: "list",
      message: "Choose your method for authentication:",
      choices: getChoices(),
      default: "basic"
    });
  },
  askGithubCredentials: () => {
    const questions = [
      {
        name: "username",
        type: "input",
        message: "Enter your GitHub username or e-mail address:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your username or e-mail address.";
          }
        }
      },
      {
        name: "password",
        type: "password",
        message: "Enter your password:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your password.";
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  getTwoFactorAuthenticationCode: () => {
    return inquirer.prompt({
      name: "twoFactorAuthenticationCode",
      type: "input",
      message: "Enter your two-factor authentication code:",
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter your two-factor authentication code.";
        }
      }
    });
  },
  askPersonalAccessToken: () => {
    return inquirer.prompt({
      name: "personalAccessToken",
      type: "input",
      message: "Paste your personal acccess token:",
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return "Please copy your PA token from GitHub and paste it here.";
        }
      }
    });
  },
  askRepoDetails: () => {
    const argv = require("minimist")(process.argv.slice(2));

    const questions = [
      {
        type: "input",
        name: "name",
        message: "Enter a name for the repository:",
        default: argv._[0] || files.getCurrentDirectoryBase(),
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter a name for the repository.";
          }
        }
      },
      {
        type: "input",
        name: "description",
        default: argv._[1] || null,
        message: "Optionally enter a description of the repository:"
      },
      {
        type: "list",
        name: "visibility",
        message: "Public or private:",
        choices: ["public", "private"],
        default: "public"
      }
    ];
    return inquirer.prompt(questions);
  },
  askIgnoreFiles: filelist => {
    const questions = [
      {
        type: "checkbox",
        name: "ignore",
        message: "Select the files and/or folders you wish to ignore:",
        choices: filelist,
        default: ["node_modules", "bower_components"]
      }
    ];
    return inquirer.prompt(questions);
  }
};
