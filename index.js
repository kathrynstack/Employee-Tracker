const inquirer = require('inquirer');
const db = require('./config/connection');
const cTable = require('console.table');

const question = [
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'action',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
    },
]

const querys = {
    'View All Employees': {
        query: `
            SELECT 
                e.id, 
                e.first_name, 
                e.last_name, 
                r.title,
                d.name as department,
                r.salary,
                (select concat(first_name, ' ', last_name) from employee where id = e.manager_id) as manager
            FROM employee e 
            JOIN role r ON e.role_id = r.id 
            JOIN department d ON r.department_id = d.id`
    },

    'Add Employee': { 
        query: `insert into employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
        values: [
            {
                type: 'input',
                message: 'What is the employees first name?',
                name: 'first'
            },
            {
                type: 'input',
                message: 'What is the employees last name?',
                name: 'last'
            },
            {
                type: 'input',
                message: 'What is the employees role id?',
                name: 'role',
                validate: isNumber
            },
            {
                type: 'input',
                message: 'What is the employees manager id?',
                name: 'manager',
                validate: isNumber
            }
        ]
    },

    'Update Employee Role': { 
        query: 'UPDATE employee SET role_id = ? WHERE id = ?',
        values: [
            {
                type: 'input',
                message: 'What is the role id that you want to assign the employee?',
                name: 'role-id',
                validate: isNumber
            },
            {
                type: 'input',
                message: 'What employee id do you want to update?',
                name: 'employee-id',
                validate: isNumber
            }
        ]
    },

    'View All Roles': {
        query: `
            SELECT
                r.title as job_title,
                r.id,
                d.name as department,
                r.salary
            FROM role r
            JOIN department d ON r.department_id = d.id`},

    'Add Role': { 
        query: `insert into role (title, salary, department_id) VALUES (?, ?, ?)`,
        values: [
            {
                type: 'input',
                message: 'What is the title of this role?',
                name: 'title'
            },
            {
                type: 'input',
                message: 'What is the salary?',
                name: 'salary',
                validate: isNumber
            },
            {
                type: 'input',
                message: 'What is the department id?',
                name: 'department-id',
                validate: isNumber
            }
        ]
    },

    'View All Departments': { 
        query: `SELECT * FROM department` 
    },

    'Add Department': { 
        query: `insert into department (name) VALUES (?)`,
        values: [
            {
                type: 'input',
                message: 'What is the new departments name?',
                name: 'department-name'
            }
        ]
    }
}

function isNumber(input) {
    if (!isNaN(input)) {
        return true;
    }
    return 'Input must be a number';
}

async function main() {
    const action = await inquirer.prompt(question).then((response) => { return response.action });

    if (action !== 'Quit') {
        query = querys[action]['query'];
        
        let values = [];
        if (querys[action]['values']) {
            values = await inquirer.prompt(querys[action]['values']).then((response) => { return Object.values(response) });
        }
    
        await db.promise().query(query, values).then((ret) => console.table(ret[0]));
        main();
    }
    else {
        db.end();
    }
}

main();