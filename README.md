<div align="center">
  <div style="width: 100px;">
    <img src="./assets/logo.png" alt="Book me logo" />
  </div>
  <h1> <strong>Book</strong>: The Open-Source Scheduling Infrastructure for Professionals</h1>
  <p></p>

  <p>
    <img src="https://img.shields.io/github/stars/pr4shxnt/appointments?style=flat-square&color=black&logo=github" alt="Stars" />
    <img src="https://img.shields.io/github/forks/pr4shxnt/appointments?style=flat-square&color=black&logo=github" alt="Forks" />
    <img src="https://img.shields.io/github/license/pr4shxnt/appointments?style=flat-square&color=black" alt="License" />
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Lucide_React-F5B041?style=flat-square&logo=lucide" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white" />
    <img src="https://img.shields.io/badge/Nodemailer-000000?style=flat-square&logo=gmail&logoColor=white" />
    <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white" />
    <img src="https://img.shields.io/badge/ICS_Generator-000000?style=flat-square&logo=calendar" />
  </p>
</div>

---

## Introduction

Book is a robust, self-hosted scheduling platform designed to replace proprietary booking services. It offers a complete infrastructure for managing appointments, availability, and client communications without relying on third-party SaaS providers. Built with a focus on data sovereignty, performance, and aesthetic minimalism, Book provides a white-label solution that adapts instantly to the user's brand identity.

## The Problem

In the current digital landscape, professionals face several critical issues with existing scheduling tools:

1.  **Vendor Lock-in and Costs**: Most scheduling platforms operate on a subscription model. Essential features like removing branding, automated reminders, and custom email workflows are often locked behind expensive payment tiers.
2.  **Data Privacy Concerns**: Third-party services retain sensitive client data, meeting notes, and email lists. Users have little control over how this data is stored or processed.
3.  **Lack of Brand Ownership**: Standard tools force their own branding upon the user (e.g., "Powered by X"), diluting the professional's personal brand presence.
4.  **Rigid Customization**: Modifying the scheduling flow or UI to match specific business requirements is often impossible in closed-source proprietary systems.

## The Solution

Book addresses these challenges by providing a 100% open-source, deployable architecture that solves the scheduling problem at the infrastructure level.

1.  **Zero Cost & Sustainability**: Designed to run on free tiers of modern cloud providers (like Vercel and MongoDB Atlas), eliminating recurring subscription costs entirely.
2.  **Total Data Sovereignty**: The user owns the database. All client information, appointment details, and logs remain in the user's private control.
3.  **One-Variable Branding**: The system utilizes a novel configuration approach where a single environment variable (`ADMIN_NAME`) propagates across the entire stack. This automatically brands the User Interface, SEO metadata, and email signatures, providing an instant white-label experience.
4.  **Modern Technical Foundation**: Built on the latest web standards (React 19, Node.js), ensuring high performance, accessibility, and ease of modification for developers.

## Technical Architecture

The application is architected as a decoupled client-server system, ensuring scalability and separation of concerns.

### Frontend (Client)

The user interface is constructed using **React 19** and **TypeScript**, leveraging **Vite** for optimized build performance.

- **State Management**: Redux Toolkit manages complex application states, including booking flows and availability slots.
- **Styling**: Tailwind CSS combined with ShadcnUI provides a design system that is responsive, accessible, and theme-consistent.
- **Routing**: React Router manages navigation between public booking views and the secure administrative dashboard.

### Backend (Server)

The API layer is built with **Node.js** and **Express**, adhering to RESTful principles.

- **Database**: MongoDB (via Mongoose) stores unstructured data for availability rules, booking records, and user credentials.
- **Security**: Authentication is handled via JSON Web Tokens (JWT). Critical operations employ One-Time Passwords (OTP) for enhanced security.
- **Scheduling Logic**: A dedicated service handles timezone conversions using `date-fns-tz`, ensuring accurate slot calculations across global timezones.
- **Communications**: Nodemailer facilitates transactional emails, wrapping content in responsive HTML templates.

---

## Environment Configuration

Correct configuration of environment variables is essential for the application's operation. These variables control authentication, database connections, and external integrations.

### Server Variables (`server/.env`)

| Variable         | Required | Description                                                                                              |
| :--------------- | :------- | :------------------------------------------------------------------------------------------------------- |
| `ADMIN_NAME`     | Yes      | The display name for the brand (e.g., "Dr. Smith"). This value is interpolated globally.                 |
| `ADMIN_EMAIL`    | Yes      | The email address used for administrative login.                                                         |
| `ADMIN_PASSWORD` | Yes      | The strict password for the admin account.                                                               |
| `ADMIN_TIMEZONE` | Yes      | The IANA timezone identifier for availability calculations (e.g., `America/New_York`, `Asia/Kathmandu`). |
| `ADMIN_URL`      | Yes      | The public URL of the deployed application (used in email footers).                                      |
| `MONGO_URI`      | Yes      | The connection string for the MongoDB instance.                                                          |
| `JWT_SECRET`     | Yes      | A cryptographically strong string used to sign session tokens.                                           |
| `EMAIL_SERVICE`  | No       | The email service provider (default: `gmail`).                                                           |
| `EMAIL_USER`     | Yes      | The email address used to send outgoing notifications.                                                   |
| `EMAIL_PASS`     | Yes      | The application-specific password for the email account.                                                 |
| `MEET_LINK`      | Yes      | The static link for video conferencing (e.g., Google Meet or Zoom URL).                                  |
| `PORT`           | No       | The port on which the server listens (default: `5000`).                                                  |

### Client Variables (`client/.env`)

| Variable          | Required | Description                                                                    |
| :---------------- | :------- | :----------------------------------------------------------------------------- |
| `VITE_API_URL`    | Yes      | The absolute URL of the backend API (e.g., `https://your-api.vercel.app/api`). |
| `VITE_ADMIN_NAME` | Yes      | Must match `ADMIN_NAME` for client-side SEO and display consistency.           |

---

## Deployment Strategy

To maintain the integrity of the ecosystem and ensure users can manage their own updates, we support a specific deployment workflow.

### Prerequisites

- A GitHub account.
- A Vercel account (or any Node.js hosting provider).
- A MongoDB Atlas cluster (free tier).

### Step 1: Fork the Repository

Do not clone the repository directly to deployment services. Instead, navigate to the GitHub repository page and click **Fork**. This creates a copy under your personal namespace, giving you write access and control over your deployment source.

### Step 2: Configure Environment

Before deploying, ensure you have all the values listed in the **Environment Configuration** section prepared.

### Step 3: Deploy

1.  Connect your forked repository to your hosting provider.
2.  Input the environment variables during the setup process.
3.  Deploy. The build script `npm run setup` handles the installation of dependencies for both client and server subsystems.

---

## Contribution Guidelines

We welcome contributions from the developer community to enhance the stability and feature set of Book.

1.  **Fork the Project**: Create your own copy of the repository.
2.  **Create a Feature Branch**: Work on your feature in a dedicated branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit Changes**: Ensure your code is clean, commented, and follows the existing style patterns (`git commit -m 'Add some AmazingFeature'`).
4.  **Push to Branch**: Push your changes to your fork (`git push origin feature/AmazingFeature`).
5.  **Open a Pull Request**: Submit your changes for review against the `main` branch.

Please ensure that any new features include appropriate error handling and do not introduce security vulnerabilities.

---

## Acknowledgements

This project was made possible by the incredible open-source ecosystem. Special thanks to the creators and maintainers of:

- **React** - For the powerful UI library.
- **Vite** - For the next-generation frontend tooling.
- **Tailwind CSS** - For the utility-first CSS framework.
- **ShadcnUI** - For the beautiful, accessible component primitives.
- **Express** & **Node.js** - For the robust server-side runtime.
- **MongoDB** - For the flexible document-based database.
- **Nodemailer** - For the reliable email sending service.
- **Vercel** - For the seamless deployment platforms.

---

## Author

**Prashant Adhikari**

- Website: [prashantadhikari7.com.np](https://prashantadhikari7.com.np)
- GitHub: [@pr4shxnt](https://github.com/pr4shxnt)

---

## License

This project is distributed under the MIT License. This ensures that the software remains free and open-source, allowing users to modify, distribute, and use it for private or commercial purposes without restriction.

---

<p align="center">
  <strong>Developed by Prashant Adhikari</strong>
</p>
