const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const Configstore = require("configstore");
const moment = require("moment");
const momentPlugin = require("moment-precise-range-plugin");

const files = require("./files");
const github = require("./github");
const repo = require("./repo");
const inquirer = require("./inquirer");

const pkg = require("../package.json");
const conf = new Configstore(pkg.name);

module.exports = {
  run: () => {
    clear();

    console.log(
      chalk.greenBright(figlet.textSync("GinIt!", { horizontalLayout: "full" }))
    );

    if (files.directoryExists(".git")) {
      console.log(chalk.red("Already a Git repository!"));
      process.exit();
    }
    const getGithubToken = async () => {
      // Fetch token from config store
      let token = github.getStoredGithubToken();
      if (token) {
        return token;
      }

      let method = await inquirer.askMethodForAuth();

      if (method.methodForAuth == "basic") {
        const timeTo = moment("2020-09-30 07:00:00").preciseDiff(moment());
        console.log(
          "GitHub is deprecating basic login.\nTime left to adapt to new api: ",
          chalk.bgYellowBright(timeTo),
          "\n"
        );

        token = await github.getPersonalAccesToken();
      } else {
        let pAT = await inquirer.askPersonalAccessToken();
        token = pAT.personalAccessToken;
        conf.set("github.token", token);
      }

      return token;
    };

    const init = async () => {
      try {
        // Retrieve & Set Authentication Token
        const token = await getGithubToken();
        github.githubAuth(token);

        // Create remote repository
        const url = await repo.createRemoteRepo();

        // Create .gitignore file
        await repo.createGitignore();

        // Set up local repository and push to remote
        await repo.setupRepo(url);

        console.log(chalk.green("All done!"));
      } catch (err) {
        if (err) {
          switch (err.status) {
            case 401:
              console.log(
                chalk.red(
                  "Couldn't log you in. Please provide correct credentials/token."
                )
              );
              break;
            case 422:
              console.log(
                chalk.red(
                  "There is already a remote repository or token with the same name"
                )
              );
              break;
            default:
              console.log(chalk.red(err));
          }
        }
      }
    };

    init();
  }
};
