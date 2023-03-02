-- Departments
INSERT INTO department (name) VALUES ('Sales');
INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ('Finance');

-- Roles
INSERT INTO role (title, salary, department_id) VALUES ('Sales Manager', 100000, 1);
INSERT INTO role (title, salary, department_id) VALUES ('Sales Representative', 50000, 1);
INSERT INTO role (title, salary, department_id) VALUES ('Software Engineer', 80000, 2);
INSERT INTO role (title, salary, department_id) VALUES ('Senior Software Engineer', 120000, 2);
INSERT INTO role (title, salary, department_id) VALUES ('Accountant', 75000, 3);
INSERT INTO role (title, salary, department_id) VALUES ('Financial Analyst', 90000, 3);

-- Employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Tom', 'Cruise', 1, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Jennifer', 'Aniston', 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Brad', 'Pitt', 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Leonardo', 'DiCaprio', 4, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Scarlett', 'Johansson', 5, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Robert', 'Downey Jr.', 5, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Meryl', 'Streep', 6, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Emma', 'Watson', 6, NULL);