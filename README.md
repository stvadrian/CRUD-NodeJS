# CRUD-NodeJS
This project implements a simple login and registration system using Node.js, Express, and a MySQL database. It provides functionalities for user authentication, registration, and redirection to a dashboard displaying registered users.

## Features

- **Login:** Users can log in with their credentials.
- **Registration:** New users can sign up by providing necessary details.
- **Dashboard:** Upon successful login, users are redirected to a dashboard displaying a list of registered users.
- **List of Registered Users:** The dashboard includes a table showing all registered users.

## Setup

### Prerequisites

- Node.js installed
- MySQL database configured in localhost

### Installation

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Set up your MySQL database and configure the database connection in `database.js`.
4. Run the application using `node index.js`.

### Usage

1. Access the application in your browser at `http://localhost:3000`.
2. Create a new user using the registration form.
3. Upon login, you'll be redirected to the dashboard displaying registered users.

## Folder Structure

- `middlewares/`: Middleware files such as authentication for routing.
- `routes/`: Express routes for different functionalities.
- `views/`: EJS templates for rendering UI.
- `app.js`: Main application file.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or create a pull request.
