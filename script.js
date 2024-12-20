import fs from 'fs';
import inquirer from 'inquirer';
import qr from 'qr-image';
import mysql from 'mysql2/promise'; // Use mysql2 for async/await support

(async () => {
  // Connect to the MySQL database
  const db = await mysql.createConnection({
    host: 'localhost', // Change if using a remote database
    user: 'root', // Your MySQL username
    password: 'password', // Your MySQL password
    database: 'qr_generator', // Your database name
  });

  console.log('Connected to the database!');

  // Prompt the user for input
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'link',
        message: 'Write the link you want to convert into the QR code:',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Name your QR code:',
      },
    ])
    .then(async (answers) => {
      const { link, name } = answers;

      // Write the link and name to a text file
      fs.appendFile('links.txt', `link: ${link}\tname: ${name}\n`, (err) => {
        if (err) throw err;
      });

      // Generate the QR code
      const qrCode = qr.image(link);
      qrCode.pipe(
        fs.createWriteStream(
          `/Users/dilayecemaral/Desktop/summer24/JavaScript Projects/QR_generator/${name}.png`
        )
      );

      // Insert the link and name into the MySQL database
      try {
        const [result] = await db.execute(
          'INSERT INTO qr_codes (link, name) VALUES (?, ?)',
          [link, name]
        );
        console.log(`Data inserted into database! ID: ${result.insertId}`);
      } catch (error) {
        console.error('Error inserting data into the database:', error);
      }

      // Close the database connection
      await db.end();
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.error(
          "Prompt couldn't be rendered in the current environment"
        );
      } else {
        console.error(error);
      }
    });
})();
