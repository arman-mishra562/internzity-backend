# InternZity Backend

---

## Table of Contents

1. [Tech Stack](#tech-stack)  
2. [Prerequisites](#prerequisites)  
3. [Getting Started](#getting-started)  
   1. [Clone & Install](#clone--install)  
   2. [Environment Variables](#environment-variables)  
   3. [Database Setup](#database-setup)  
   4. [Run the Server](#run-the-server)  
4. [Project Structure](#project-structure)  
5. [API Endpoints](#api-overview)       
6. [Contributing](#contributing)
7. [Live Link](#live-link)
8. [License](#license)   

---

## Tech Stack

- **Runtime**: Node.js  
- **Server**: Express.js  
- **Language**: TypeScript  
- **ORM**: Prisma  
- **DB**: PostgreSQL (Neon)  
- **Validation**: Zod  
- **Mailer**: Nodemailer (Hostinger SMTP)  
- **Auth**: JWT (jsonwebtoken), bcryptjs  
- **Payments**: razorpay, @paypal/checkout-server-sdk  
- **Utilities**: date-fns, nanoid  

---

## Prerequisites

- **Node.js** v16+  
- **pnpm** package manager  
- **PostgreSQL** database URL  
- **SMTP credentials** (Hostinger or any SMTP)  
- **PayPal** & **Razorpay** sandbox credentials  

---

## Getting Started

### Clone & Install

```bash
git clone <repo-url>
cd backend
pnpm install
```

### Environment Variables

Create a `.env` in the project root:

```env
cp .env.example .env
```

### Database Setup

Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### Run the Server

```bash
pnpm run build
pnpm run start
```

Server: http://localhost:3000

---

## Project Structure

```
src/
├── app.ts
├── config/
├── controllers/
├── middlewares/
├── routes/
├── schemas/
├── services/
├── utils/
└── prisma/
```

---

## API Overview

See [POSTMAN COLLECTION](https://documenter.getpostman.com/view/39805087/2sB2j7cUYF) for full endpoint list and details.

---

## Contributing

Feel free to open issues and PRs!

---

## Live Link

Call endpoints directly using Deployed Link.
```
https://internzity-backend.onrender.com
```

---

## License

MIT © ARMAN MISHRA / ZYLENTRIX
