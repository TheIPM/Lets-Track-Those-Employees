const express = require('express');
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');


const app = express();
app.use(express.json());



const connection = mysql.createPool( {
    host: 'localhost',
    user: 'root',
    password: '4anp488K.',
    database: 'company_db'
});

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

app.post('/departments', async (req, res) => {
  const { name } = req.body;
  const [result] = await connection.query('INSERT INTO department (name) VALUES (?)', [name]);
  res.json({ id: result.insertId });
});

app.post('/roles', async (req, res) => {
  const { title, salary, department_id } = req.body;
  const [result] = await connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department_id]);
  res.json({ id: result.insertId });
});

app.post('/employees', async (req, res) => {
  const { first_name, last_name, role_id, manager_id } = req.body;
  const [result] = await connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [first_name, last_name, role_id, manager_id]);
  res.json({ id: result.insertId });
});

app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;
  await connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_id, id]);
  res.sendStatus(204);
});



async function main() {
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
          { name: 'Update an employee role', value: 'updateEmployeeRole' }
        ]
      }
    ]);
  
    switch (action) {
        case 'viewDepartments':
          const [rows] = await connection.execute('SELECT id, name FROM department');
          console.table(rows);
          break;
        case 'viewRoles':
          const [rows2] = await connection.execute('SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id');
          console.table(rows2);
          break;
        case 'viewEmployees':
          const [rows3] = await connection.execute('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id');
          console.table(rows3);
          break;
          case 'addDepartment':
            const { departmentName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the department:'
          }
        ]);
        await connection.execute('INSERT INTO department (name) VALUES (?)', [departmentName]);
        console.log(`Department '${departmentName}' added successfully.`);
        break;
        case 'addRole':
            const [departmentRowsForRole] = await connection.execute('SELECT id, name FROM department');
            const { title, salary, department_id } = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:'
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role:'
          },
          {
            type: 'list',
            name: 'department_id',
            message: 'Select the department for the role:',
            choices: departmentRowsForRole.map(department => ({ name: department.name, value: department.id }))
          }
        ]);
        await connection.execute('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department_id]);
        console.log(`Role '${title}' added successfully.`);
        break;
        case 'addEmployee':
            const [roleRowsForEmployee] = await connection.execute('SELECT id, title FROM role');
            const [managerRowsForEmployee] = await connection.execute('SELECT id, first_name, last_name FROM employee');
            const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
              {
                type: 'input',
                name: 'first_name',
                message: 'Enter the first name of the employee:'
              },
              {
                type: 'input',
                name: 'last_name',
                message: 'Enter the last name of the employee:'
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
              }
            ]);
            await connection.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [first_name, last_name, role_id, manager_id]);
      console.log(`Employee '${first_name} ${last_name}' added successfully.`);
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
          default:
            console.error(`Invalid action: ${action}`);
            break;
        }
        
        await connection.end();}
    
    main().catch(err => {
      console.error(err);
      connection.end();
    });

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});