#!/usr/bin/env node

const actual = require('@actual-app/api');
const query = require('@actual-app/api/query');
const colors = require('colors/safe');
const d = require('date-fns');

let budgets = {};
let force = process.argv.indexOf('--force') > 0;
let preview = process.argv.indexOf('--preview') > 0;
if(!process.argv[2]) {
    console.error(colors.red('actual-budget-reports budget-id'));
    return;
}

actual.runWithBudget(process.argv[2], run);

async function run() {

    let months = await actual.getBudgetMonths();

    console.log('Income and Expenses');
    console.log();
    console.log(`, ${months.join(', ')}`);
    let net_income = [];

    await export_groups(true, months, net_income);
    console.log('Expenses');
    console.log();
    await export_groups(false, months, net_income);

    console.log(`Net Income, ${net_income.join(', ')}`);
}

async function export_groups(is_income, months, net_income) {

    let totals = [];

    let category_groups = (await actual.runQuery( 
        query('category_groups')
        .filter({ 'is_income': { $eq: is_income } })
        .orderBy(['sort_order'])
        .select(['id', 'name'])
    )).data;

    for(let g = 0; g < category_groups.length; g++) {
        let categories = (await actual.runQuery( 
            query('categories')
            .filter({ 'group.id': { $eq: category_groups[g].id } })
            .orderBy(['sort_order'])
            .select(['id', 'name'])
        )).data;

        let group_totals = [];
        console.log(category_groups[g].name);
        for(let c = 0; c < categories.length; c++) {
            let line = `- ${categories[c].name}`;
            
            let category_totals = []
            for(let m = 0; m < months.length; m++) {

                let amount = (await actual.runQuery( 
                    await query('transactions')
                        .filter({ '$and': [ 
                            { date: { $transform: '$month', $eq: months[m] } },
                            { 'category.id': { $eq: categories[c].id } }
                        ]})
                        .calculate({ '$sum': '$amount' })
                )).data / 100;
                group_totals[m] = (group_totals[m] || 0) + amount;
                totals[m] = (totals[m] || 0) + amount;
                net_income[m] = (net_income[m] || 0) + amount;
                line += `, ${amount}`
            }
            console.log(line);        
        }
        console.log(`Total ${category_groups[g].name}, ${group_totals.join(', ')}`);
        console.log();
    }
    if(!is_income) {
        console.log(`Total Expenses, ${totals.join(', ')}`)
        console.log();
    }
}