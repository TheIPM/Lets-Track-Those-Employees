const express = require('express');
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const app = express();
app.use(express.json());

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'company_db',
});

const goBackPrompt = {
  type: 'list',
  name: 'goBack',
  message: 'What would you like to do?',
  choices: ['Return to main menu'],
};

app.get('/departments', async (req, res) => {
  const [rows] = await connection.query('SELECT id, name FROM department');
  res.json(rows);
});

app.get('/roles', async (req, res) => {
  const [rows] = await connection.query('SELECT id, title, salary, department_id FROM role');
  res.json(rows);
});

app.get('/employees', async (req, res) => {
  const [rows] = await connection.query('SELECT id, first_name, last_name, role_id, manager_id FROM employee');
  res.json(rows);
});



async function main() {
  console.log("***********************************")
  console.log("*    Let's Track Those Pesky      *")
  console.log("*        EMPLOYEES!               *")
  console.log("*                                 *")
  console.log("*********************************\n")
  let running = true;
  
  while (running) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'View all departments', value: 'viewDepartments' },
          { name: 'View all roles', value: 'viewRoles' },
          { name: 'View all employees', value: 'viewEmployees' },
          { name: 'Add a department', value: 'addDepartment' },
          { name: 'Add a role', value: 'addRole' },
          { name: 'Add an employee', value: 'addEmployee' },
          { name: 'Update an employee role', value: 'updateEmployeeRole' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    switch (action) {
      case 'viewDepartments':
        const [deptRows] = await connection.execute('SELECT id, name FROM department');
        console.table(deptRows);
        await inquirer.prompt(goBackPrompt);
        break;
      case 'viewRoles':
        const [roleRows] = await connection.execute(
          'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id'
        );
        console.table(roleRows);
        await inquirer.prompt(goBackPrompt);
        break;
      case 'viewEmployees':
        const [employeeRows] = await connection.execute(
          'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id'
        );
        console.table(employeeRows);
        await inquirer.prompt(goBackPrompt);
        break;
      case 'addDepartment':
        const { departmentName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the department:',
          },
        ]);
        await connection.execute('INSERT INTO department (name) VALUES (?)', [departmentName]);
        console.log(`Department '${departmentName}' added successfully.`);
        break;
      case 'addRole':
        const [deptRowsForRole] = await connection.execute('SELECT id, name FROM department');
        const { title, salary, department_id } = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:',
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role:',
          },
          {
            type: 'list',
            name: 'department_id',
            message: 'Select the department for the role:',
            choices: deptRowsForRole.map((dept) => ({ name: dept.name, value: dept.id })),
          },
        ]);
        await connection.execute('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
          title,
          salary,
          department_id,
        ]);
        console.log(`Role '${title}' added successfully.`);
        break;
      case 'addEmployee':
          let addEmployeeRunning = true;
          while (addEmployeeRunning) {
          const [roleRowsForEmployee] = await connection.execute('SELECT id, title FROM role');
          const [managerRowsForEmployee] = await connection.execute(
          'SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL'
    );
           const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      {
           type: 'input',
           name: 'first_name',
          message: 'Enter the first name of the employee:',
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Enter the last name of the employee:',
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select the role for the employee:',
        choices: roleRowsForEmployee.map(role => ({ name: role.title, value: role.id }))
      },
      {
        type: 'list',
        name: 'manager_id',
        message: 'Select the manager for the employee:',
        choices: [...managerRowsForEmployee.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id })), { name: 'None', value: null }]
      },
      {
        type: 'list',
        name: 'continueAdding',
        message: 'Do you want to add another employee?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No, return to main menu', value: false }
        ]
      }
    ]);

    await connection.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [first_name, last_name, role_id, manager_id]);
    console.log(`Employee '${first_name} ${last_name}' added successfully.`);
    
    const { continueAdding } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAdding',
        message: 'Do you want to add another employee?',
      },
    ]);
    
    if (!continueAdding) {
      addEmployeeRunning = false;
    }
  }
  break;
        
      case 'updateEmployeeRole':
        const [employeeRowsForUpdate] = await connection.execute('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
        const [roleRowsForUpdate] = await connection.execute('SELECT id, title FROM role');
        const { employee_id, new_role_id } = await inquirer.prompt([
          {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee to update:',
            choices: employeeRowsForUpdate.map(employee => ({ name: employee.name, value: employee.id }))
          },
          {
            type: 'list',
            name: 'new_role_id',
            message: 'Select the new role for the employee:',
            choices: roleRowsForUpdate.map(role => ({ name: role.title, value: role.id }))
          }
        ]);
        await connection.execute('UPDATE employee SET role_id = ? WHERE id = ?', [new_role_id, employee_id]);
        console.log(`Employee updated successfully.`);
        break;
    
      case 'exit':
        running = false;
        break;
    
     
        default:
          console.error(`Invalid action: ${action}`);
          break;
      }
    }
    
    if (!running) {
      await connection.end();
      console.log("Goodbye!");
      return;
    }
  
    await connection.end();
  }
  
  main().catch((err) => {
    console.error(err);
    connection.end();
  });
  
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });