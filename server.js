const db = require("./db/connection");
const cTable = require("console.table");
const inquirer = require("inquirer");

// Start server after DB connection
db.connect((err) => {
  if (err) throw err;
  console.log("Database connected.");
  promptQuestion();
});

//The question that starts it off and serves as the hub
const promptQuestion = () => {
  inquirer
    .prompt({
      type: "list",
      message: "Do something.",
      name: "choice",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add a Department",
        "Add a Role",
        "All Done",
      ],
    })
    .then((answer) => {
      if (answer.choice === "View All Departments") {
        viewAllDepartments();
      } else if (answer.choice === "View All Roles") {
        viewAllRoles();
      } else if (answer.choice === "View All Employees") {
        viewAllEmployees();
      } else if (answer.choice === "Add a Department") {
        AddDepartment();
      } else if (answer.choice === "Add a Role") {
        AddRole();
      } else if (answer.choice === "All Done") {
        console.log("You did it!!!");
        process.exit();
      }
    });
};

//Peek at all the Departments
const viewAllDepartments = () => {
  console.log("");
  console.log("*******************************");
  console.log("       All Departments         ");
  console.log("");
  console.log("*******************************");

  const sql = `SELECT department.id, department.name AS department_names FROM department`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.table(rows);

    promptQuestion();
  });
};

//Peek at all the Roles
const viewAllRoles = () => {
  console.log("");
  console.log("*******************************");
  console.log("          All Roles            ");
  console.log("");
  console.log("*******************************");

  const sql = `SELECT role.title AS job_title,
                role.id,
                department.name AS department,
                role.salary
                FROM role
                LEFT JOIN department ON role.department_id = department.id`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.table(rows);

    promptQuestion();
  });
};

//Peek at all the Departments
const viewAllEmployees = () => {
  console.log("");
  console.log("*******************************");
  console.log("         All Employees         ");
  console.log("");
  console.log("*******************************");

  const sql = `SELECT employee.id,
                employee.first_name,
                employee.last_name,
                role.title AS job_title,
                department.name AS department,
                role.salary,
                CONCAT (manager.first_name, " ", manager.last_name) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.table(rows);

    promptQuestion();
  });
};

//Add a Department
const AddDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the new department? (Required)",
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log("Please enter the Department's Name!");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (name)
      VALUES (?)`;

      db.query(sql, answer.name, (err, result) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        promptQuestion();
      });
    });
};

//Add a Role
const AddRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the new Role? (Required)",
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log("Please enter the Role's Name!");
            return false;
          }
        },
      },
      {
        type: "number",
        name: "salary",
        message: "What is the New Role's salary? (Required)",
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log(
              " is not a number.  Please enter the salary!  Press up then down to clear NaN error message and try again."
            );
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      console.log(answer.name);
      console.log(answer.salary);

      const params = [answer.role, answer.salary];

      // grab dept from department table
      const deptInfo = `SELECT name, id FROM department`;

      db.query(deptInfo, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department is this role in?",
              choices: dept,
            },
          ])
          .then((deptChoice) => {
            const dept = deptChoice.dept;
            params.push(dept);
          });

        // db.query(sql, answer.name, (err, result) => {
        //   if (err) {
        //     res.status(400).json({ error: err.message });
        //     return;
        //   }
        promptQuestion();
        // });
      });
    });
};
