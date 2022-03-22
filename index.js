#!/usr/bin/env node

const actual = require('@actual-app/api');
const query = require('@actual-app/api/query');
const colors = require('colors/safe');
const d = require('date-fns');

let budget_id = process.argv[2];
let report_name = process.argv[3];


if(!budget_id) {
    console.error(colors.red('Missing budget-id parameter.\n'));
    usage();
    return;
}

function usage() {
    console.error('Usage: actual-budget-reports <budget-id> <report-name> [report-params]\n');
    console.error('Parameters:')
    console.error('  budget-id: Your budget id in the "Advanced" section of the settings page.')
    console.error('  report-name: The name of the report. Options: ive, reimbursements.')
    console.error('')
    console.error('Report Specific Parameters');
    console.error(' ive : [from-month] [to-month]')
    console.error('  from-month: The first month to start the report from in yyyy-mm format. Optional')
    console.error('  to-month: The last month of the report from in yyyy-mm format. Optional')
    console.error(' reimbursements')
    console.error('  group-name: The name of the category group that contains reimbursement categories.')


}

actual.runWithBudget(process.argv[2], run);

async function run() {
    switch(report_name) {
        case 'ive':
            await ive_report();
            break;
        case 'reimbursements':
            await reimbursements_report();
            break;
        default: 
            console.error(colors.red('Invalid report parameter.\n'));
            usage();
            break;    
    }
}

async function ive_report() {
    let months = await ive_getMonths();

    console.log('Income and Expenses');
    console.log();
    console.log(`,, ${months.join(', ')}, Total, Average`);
    let net_income = [];

    await export_groups(true, months, net_income);
    console.log('Expenses');
    console.log();
    await export_groups(false, months, net_income);

    let net_income_line = ''
    let total_net_income = 0;
    for(let t = 0; t < net_income.length; t++) {
        total_net_income += net_income[t];
        net_income_line += `${Number(net_income[t]).toFixed(2)}, `
    }
    console.log(`Net Income,, ${net_income_line}${Number(total_net_income).toFixed(2)}, ${Number(total_net_income/months.length).toFixed(2)}`);
}

async function export_groups(is_income, months, net_income) {

    let totals = [];

    let category_groups = (await actual.runQuery(
        query('category_groups')
        .filter({ 'is_income': { $eq: is_income } })
        .orderBy(['sort_order'])
        .select(['id', 'name'])
    )).data;

    if(is_income && category_groups.length > 1) {
        throw `Did not expect ${category_groups.length} income groups.  Please report to developer.`
    }

    for(let g = 0; g < category_groups.length; g++) {
        let categories = (await actual.runQuery( 
            query('categories')
            .filter({ 'group.id': { $eq: category_groups[g].id } })
            .orderBy(['sort_order'])
            .select(['id', 'name'])
        )).data;

        let output_group = false;
        let group_totals = [];
        for(let c = 0; c < categories.length; c++) {
            let line = `,"${categories[c].name}"`;
            let line_total = 0;
            let output_category = false;
            
            let category_totals = []
            for(let m = 0; m < months.length; m++) {

                let amount = ((await actual.runQuery( 
                    await query('transactions')
                        .filter({ '$and': [ 
                            { date: { $transform: '$month', $eq: months[m] } },
                            { 'category.id': { $eq: categories[c].id } }
                        ]})
                        .calculate({ '$sum': '$amount' })
                )).data / 100);
                group_totals[m] = (group_totals[m] || 0) + amount;
                totals[m] = (totals[m] || 0) + amount;
                net_income[m] = (net_income[m] || 0) + amount;
                line += `, ${Number(amount).toFixed(2)}`
                line_total += amount;
                if(amount != 0) {
                    output_category = true;
                    if(!output_group) {
                        console.log(category_groups[g].name);
                        output_group = true;    
                    }
                }
            }
            if(output_category) {
                console.log(`${line}, ${Number(line_total).toFixed(2)}, ${Number(line_total/months.length).toFixed(2)}`);
            }
        }
        if(output_group) {
            let group_total_line = ''
            let group_total = 0;
            for(let t = 0; t < group_totals.length; t++) {
                group_total += group_totals[t];
                group_total_line += `${Number(group_totals[t]).toFixed(2)}, `
            }
            console.log(`"Total ${category_groups[g].name}",, ${group_total_line}${Number(group_total).toFixed(2)}, ${Number(group_total/months.length).toFixed(2)}`);
            console.log();    
        }
    }
    if(!is_income) {

        let total_expenses_line = ''
        let total_expenses = 0;
        for(let t = 0; t < totals.length; t++) {
            total_expenses += totals[t];
            total_expenses_line += `${Number(totals[t]).toFixed(2)}, `
        }

        console.log(`Total Expenses,, ${total_expenses_line}${Number(total_expenses).toFixed(2)}, ${Number(total_expenses/months.length).toFixed(2)}`)
        console.log();
    }
}

async function ive_getMonths() {

    let months = await actual.getBudgetMonths();

    let from_month = process.argv[4];
    let from_month_index = 0;
    if(from_month) {
        let pos = months.indexOf(from_month);
        if(pos != -1) {
            from_month_index = pos;
        }
    }
    let to_month = process.argv[5];
    let to_month_index;
    if(to_month) {
        let pos = months.indexOf(to_month);
        if(pos != -1) {
            to_month_index = pos;
        }
    } else {
        let this_month = d.format(new Date(), 'yyyy-MM');
        to_month_index = months.indexOf(this_month)
    }
    months = months.slice(from_month_index, to_month_index + 1);
    return months;
}

async function reimbursements_report() {


    let group_name = process.argv.slice(4).join(' ');

    console.log(group_name)
 
    let categories = (await actual.runQuery( 
        query('categories')
        .filter({ 'group.name': { $eq: group_name } })
        .orderBy(['sort_order'])
        .select(['id', 'name'])
    )).data;

    for(let c = 0; c < categories.length; c++) {

        console.log();
        console.log(categories[c].name)
        console.log()
        console.log('Date, Account, Payee, Notes, Amount, Running Balance')

        let transactions = (await actual.runQuery( 
            await query('transactions')
                .filter({ 'category.id': { $eq: categories[c].id } })
                .orderBy('date')
                .select(['date', 'account.name', 'payee.name', 'notes', 'amount'])
        )).data;

        let running_balance = 0;
        for(let t = 0; t < transactions.length; t++) {
            running_balance += (transactions[t].amount/100);
            console.log(`${transactions[t].date}, "${transactions[t]['account.name']}", "${transactions[t]['payee.name']}", "${transactions[t].notes || ''}", ${Number(transactions[t].amount/100).toFixed(2)}, ${Number(running_balance).toFixed(2)}`)
        }
        
    }



}
