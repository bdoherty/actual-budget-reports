# actual-budget-reports
Command line utility for running reports against [ActualBudget](https://actualbudget.com/).  It prints a csv (comma delimited file) to the screen, that you can save to a file and then open in your favourite spreadsheet (Excel / Google Spreadsheet, Numbers etc)

## Usage
```
npx bdoherty/actual-budget-reports <budget-id> <report-name> [report-params...] > report.csv
npx bdoherty/actual-budget-reports <budget-id> ive [from-month] [to-month] > report.csv
npx bdoherty/actual-budget-reports <budget-id> ive [from-month] [to-month] > report.csv
actual-budget-reports <budget-id> ive [from-month] [to-month] > report.csv
actual-budget-reports <budget-id> reimbursements <group-name> > report.csv
```
* **budget-id** You can find your budget id in the "Advanced" section of the settings page. 
* **report-name** Either ```ive``` (Income vs Expenses), or ```reimbursements```

### Report Specific Parameters
#### Income and Expenses
* **from-month** The first month to start the report from in yyyy-mm format.  Optional. You can also specify a date in yyyy-mm-dd format to start part way through a month.
* **to-month** The last month to include in report in yyyy-mm format.  Optional. You can also specify a date in yyyy-mm-dd format to end part way through a month.
#### Reimbursements
* **group-name**: The name of the category group that contains reimbursement categories.

This utility uses the [Actual API](https://actualbudget.com/docs/developers/using-the-API/). Currently, the API requires Actual must be running locally before you can run the report.    To save the output to a file, you need to make sure that the end of your command has a greater than symbol (>) followed by a filename.

## Examples
```
npx bdoherty/actual-budget-reports My-Budget-Id > report.csv
```
```
npx bdoherty/actual-budget-reports My-Budget-Id 2020-04 > report.csv
```
```
npx bdoherty/actual-budget-reports My-Budget-Id 2020-04 2021-03 > report.csv
```
## Prerequisites
* Actual
* Node

## How to get started.

You can run this utility without installing it by running the following command.  This about 20 seconds slower to run, as it downloads the software each time.  As a benefit, you will always be using the latest version.

```
npx bdoherty/actual-budget-reports <budget-id> <report-name> [from-month] [to-month]
```

Alternatively you can create a new folder, and then run the following command within that folder from command prompt (on Windows) or Terminal (on Mac) to install the utility.  The utility will run faster, as it doesn't need to download the software each time it runs.

```
npm i --prefix ./ bdoherty/actual-budget-reports
```

You should then be able to run `actual-budget-report` from command prompt / Terminal from this folder.  If you want to upgrade the utility to the latest version, just run the above command from the same folder.


# Buy Me A Coffee! :coffee:

Find this tool useful?  Feel free to do it at [__Buy me a coffee! :coffee:__](https://www.buymeacoffee.com/bdoherty), I will be really thankfull for anything even if it is a coffee or just a kind comment towards my work, because that helps me a lot. Whenever you contribute with a donation, I will read your message and it will be shown in my main site.

buymeacoffee is a website that contacts developers, designers, artists, etc. with their communities so that people can contribute and help them out so that the content they offer is better since the rewarding system encourages creators to continue doing what they like and helping others.

Please make sure that you have subscribed to Actual Budget before donating, as James has created a fantastic product.

### Be careful and donate just if it is within your possibilities, because there is no refund system. And remember that you don't need to donate, it is just a free choice for you. Thank you!

# License and Disclaimer
[MIT License](LICENSE)

The developer of this tool is not associated with Actual Budget.  Any issues with this tool should be directed here and not to Actual Budget support.

