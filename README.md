# CampusHaat 🛍️

### A Student-Exclusive Online Marketplace

CampusHaat is a web-based marketplace designed to connect university students and make buying and selling products within the student community easier.

The platform provides students with a convenient space to list, discover, and purchase pre-owned or new products, encouraging affordable shopping and reuse within the campus community.

## ✨ Key Features

- **Student Registration:** Account registration using approved university email domains.
- **Email OTP Verification:** Email verification to authenticate student accounts.
- **Secure Login:** Authentication using JSON Web Tokens (JWT).
- **Product Listings:** Students can create and manage product listings.
- **Product Discovery:** Browse and explore available products.
- **Category Filtering:** Organise products into different categories.
- **Product Management:** Manage listings, including updating and deleting products.
- **Product Information:** View product descriptions, prices, conditions, and seller details.

## 🛠️ Technology Stack

| Component         | Technologies                                         |
| ----------------- | ---------------------------------------------------- |
| Frontend          | React.js, Vite, JavaScript, HTML, CSS                |
| Backend           | Java, Spring Boot                                    |
| Database          | MySQL                                                |
| Authentication    | JWT, Email OTP Verification                          |
| API Communication | REST APIs                                            |
| Development Tools | VS Code, IntelliJ IDEA, MySQL Workbench, Git, GitHub |

## 📁 Project Structure

```text
CampusHaat/
│
├── campushaat-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── campusloop-backend/
│   └── campusloop-backend/
│       ├── src/
│       └── pom.xml
│
└── .gitignore
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- Java 17 or later
- Apache Maven
- MySQL Server

### 1. Clone the Repository

```bash
git clone https://github.com/namamiraval/CampusHaat.git
cd CampusHaat
```

### 2. Set Up the Database

Create a MySQL database named:

```sql
CREATE DATABASE campusloop;
```

Configure your database credentials using environment variables.

### 3. Run the Backend

Navigate to the backend project directory:

```bash
cd campusloop-backend/campusloop-backend
```

Configure the required environment variables:

- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `MAIL_USERNAME`
- `MAIL_APP_PASSWORD`

Then start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 4. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd campushaat-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## 🚀 Future Improvements

- Cloud deployment and hosting.
- Improved product image storage.
- Enhanced search and recommendation functionality.
- Additional security and user-management features.
- Further improvements to the user interface and experience.

## 👩‍💻 Developer

**Namami Raval**

B.Tech – Computer Science and Engineering

GitHub: [@namamiraval](https://github.com/namamiraval)

---

*CampusHaat – Connecting students through a smarter campus marketplace.*
