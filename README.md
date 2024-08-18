# FoxScrb

FoxScrb is a note-taking web application that allows users to create, edit, delete, and archive their notes. Users can also manage their profiles, including changing their profile picture and password.

<img width="1034" alt="Screenshot 2024-08-17 at 4 21 37 PM" src="https://github.com/user-attachments/assets/04b6ef45-3e7c-4c81-826a-1ca25ca64661">


## Features

- User authentication (login and registration)
- Create, edit, delete, and archive notes
- Profile management (profile picture, password change)
- Responsive design
- Archive and retrieve notes

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Passport.js (for authentication)
  - bcrypt.js (for password hashing)
  
- **Frontend:**
  - EJS (Embedded JavaScript templating)
  - Bootstrap (for styling)
  
- **Other:**
  - Multer (for file uploads)
  - Method Override (for handling PUT/DELETE methods)
  - Flash messages (for user feedback)

## Installation

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **MongoDB** (Either a local instance or an Atlas account)

### Clone the Repository

```bash
git clone https://github.com/SilBrum/FoxScrb.git
cd FoxScrb
```


## Install dependencies:
```bash
npm install express mongoose express-session connect-flash passport method-override ejs

```

## Start the application:

```bash
npm start
```
### Open your browser and navigate to http://localhost:5000.


##License
This project is licensed under the MIT License.





