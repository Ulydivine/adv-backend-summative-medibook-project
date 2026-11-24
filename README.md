# MediBook API

## About the Project

MediBook is a clinic appointment booking API that I built using Node.js and Express.js. The project helps manage patients, doctors, and clinic appointments.

Patients can be registered, doctors can be managed, and appointments can be booked or cancelled. The system also checks appointment availability, applies refund rules when appointments are cancelled, and manages a waitlist when a doctor is fully booked or a requested time slot is unavailable.

I also added doctor reports, appointment statistics, audit logging, background workers, and a feedback page that supports English and French.

## Technologies Used

- **Node.js** – Runs the backend application.
- **Express.js** – Handles API routes and requests.
- **MySQL** – Stores patients, doctors, and appointments.
- **mysql2** – Connects the application to MySQL and runs SQL queries.
- **Redis** – Stores waitlist and notification jobs.
- **Jest** – Tests appointment validation and refund calculations.
- **HTML and JavaScript** – Used for the feedback page.
- **dotenv** – Loads environment variables.

## Project Structure

The project is organized into different folders to keep the code easier to understand and maintain.

```text
medibook/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── locales/
│   ├── en.json
│   └── fr.json
├── logs/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── workers/
├── tests/
├── .env.example
├── .gitignore
├── README.md
├── schema-diagram.pdf
├── package.json
└── server.js
```

### How the project is organized

- **config:** Contains the MySQL and Redis connection settings.
- **controllers:** Handles incoming requests and decides what response to return.
- **models:** Contains the SQL queries used to work with the database.
- **routes:** Defines the API endpoints for patients, doctors, appointments, and feedback.
- **middleware:** Handles errors and sends appropriate responses.
- **utils:** Contains appointment validation, refund calculations, and audit logging.
- **workers:** Contains the background workers for waitlist promotion and notifications.
- **tests:** Contains the Jest tests.
- **database:** Contains the SQL files for creating tables and inserting sample data.
- **locales:** Contains the English and French feedback page content.

## Database Design

The database uses MySQL and has three main tables:

### 1. Patients

Stores patient information, including their name, email, phone number, and registration date.

### 2. Doctors

Stores doctor information, including their name, specialty, consultation fee, and room.

### 3. Appointments

Stores appointment information and connects patients with doctors. It includes the appointment date and time, payment amount, status, and refund information.

The relationships are:

- One patient can have many appointments.
- One doctor can have many appointments.
- Each appointment belongs to one patient and one doctor.

The database uses primary keys, foreign keys, and constraints to protect the data. For example, patient emails and phone numbers must be unique, consultation fees must be positive, and a doctor cannot have two active appointments at the same date and time.

The database also allows a cancelled appointment slot to become available again.

The `schema-diagram.pdf` file contains the database diagram, including the tables, columns, data types, relationships, and constraints.

### Sample Data

The `database/seed.sql` file inserts sample data for testing:

- 3 patients
- 3 doctors
- At least 8 appointments

The sample data includes a doctor with no appointments and a doctor with a busy day close to the daily appointment limit.

## Main Features

### Patient Management

The API supports creating, viewing, updating, and deleting patient records.

### Doctor Management

The API supports creating, viewing, updating, and deleting doctor records. It also provides doctor statistics and reports.

### Appointment Booking

Patients can book appointments with doctors.

The booking rules are:

- Appointments must be in the future.
- Appointments must be between 09:00 and 17:00.
- Appointments must use 30-minute time slots.
- A doctor can have a maximum of 12 appointments per day.
- A doctor cannot have two active appointments at the same date and time.

The booking process uses a database transaction and checks availability before saving the appointment.

### Cancellation and Refunds

Patients can cancel booked appointments. The refund depends on the time remaining before the appointment:

| Cancellation time | Refund |
|---|---:|
| More than 48 hours before | 100% |
| 24 to 48 hours before | 50% |
| Less than 24 hours before | 0% |

The cancellation and refund update are handled in one database transaction to avoid updating only part of the information.

Cancelled appointment slots can be reused.

### Waitlist

Redis is used to store patients waiting for an appointment.

When an appointment is cancelled, a background worker checks the waitlist and tries to promote an eligible patient into the available slot.

If the booking fails, the patient is returned to the waitlist.

### Notifications

A separate notification worker processes jobs from Redis after an appointment is confirmed.

It records SMS and email notification messages in the audit log. These are recorded messages and are not sent through an external SMS or email service.

### Doctor Reports and Statistics

The API provides:

- Doctor revenue collected after refunds.
- Number of upcoming appointments.
- Appointments per day for the next seven days.
- Daily appointment utilization.
- A report showing appointments and revenue for each doctor.
- A report of busy days where utilization is above 80%.

The doctors' report also includes doctors who have no appointments.

### Audit Logging

Successful appointment bookings and cancellations are recorded in `logs/audit.log`.

The logger uses asynchronous file operations and creates the logs folder if it does not exist. If logging fails, the main API request can still continue.

### Feedback Page

The feedback page is available in English and French. The page content is stored in the `locales` folder.

The language can be selected using the URL:

- English: `http://localhost:3000/feedback`
- French: `http://localhost:3000/feedback?lang=fr`

If an unsupported language is requested, the page uses English.

The page also displays the current date using JavaScript's `Intl.DateTimeFormat`.

## Main API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check if the API is running |
| GET | `/patients` | Get all patients |
| GET | `/patients/:id` | Get one patient |
| POST | `/patients` | Register a patient |
| PUT | `/patients/:id` | Update a patient |
| DELETE | `/patients/:id` | Delete a patient |
| GET | `/doctors` | Get all doctors |
| GET | `/doctors/:id` | Get one doctor |
| POST | `/doctors` | Add a doctor |
| PUT | `/doctors/:id` | Update a doctor |
| DELETE | `/doctors/:id` | Delete a doctor |
| GET | `/doctors/:id/stats` | Get doctor statistics |
| GET | `/doctors/reports/summary` | Get the doctors report |
| GET | `/doctors/reports/busy-days` | Get busy days |
| GET | `/appointments` | Get all appointments |
| GET | `/appointments/:id` | Get one appointment |
| POST | `/appointments` | Book an appointment |
| PATCH | `/appointments/:id/cancel` | Cancel an appointment |
| GET | `/feedback` | Open the feedback page |

## How to Run the Project

### Requirements

Before starting, make sure you have:

- Node.js and npm installed.
- MySQL installed and running.
- Redis installed and running.
- Git installed.

### 1. Clone the repository

```bash
git clone https://github.com/Ulydivine/adv-backend-summative-medibook-project.git

cd adv-backend-summative-medibook-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and update the values to match your local MySQL and Redis setup.

The environment file should contain:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medibook
REDIS_URL=redis://localhost:6379
```

Do not upload your actual `.env` file to GitHub because it contains private configuration details.

### 4. Set up the database

Make sure MySQL is running.

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Insert the sample data:

```bash
mysql -u root -p medibook < database/seed.sql
```

### 5. Start Redis

Make sure Redis is running and that the `REDIS_URL` value in your `.env` file is correct.

### 6. Start the API

```bash
npm start
```

The API should be available at:

```text
http://localhost:3000
```

For development mode, use:

```bash
npm run dev
```

## Starting the Background Workers

The workers run separately from the main API.

Open separate terminal windows in the project folder.

Start the waitlist worker:

```bash
npm run worker:waitlist
```

Start the notification worker:

```bash
npm run worker:notifications
```

Keep the API and workers running when testing the waitlist and notification features.

## Running Tests

Run the tests using:

```bash
npm test
```

The tests use Jest and check:

- Appointment date and time validation.
- Rejecting appointments in the past.
- Rejecting appointments outside working hours.
- Rejecting times that are not on 30-minute slots.
- Refund calculations for different cancellation periods.
- Refund calculations at the 24-hour and 48-hour boundaries.

The tests run without connecting to MySQL or Redis.

## Important Project Decisions

- I used MySQL with SQL queries instead of an ORM so I could work directly with the database.
- I used parameterized queries to help prevent SQL injection.
- I used database transactions for appointment booking and cancellation.
- I used Redis to manage waitlist and notification jobs.
- I used separate workers to handle background tasks.
- I used asynchronous file operations for audit logging.
- I kept the feedback page content in separate language files so English and French can be supported.

## Author

Lydivine Umutesi

MediBook Backend Development Project
