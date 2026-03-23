

# 📂 NestJS Multi-File Management System
### *Secure S3 Storage with Dynamic Metadata Tracking*

## 👤 Author
**[Gauri Bidwai]**

---

## 📝 Project Overview
This project is a robust **File Management System** built with **NestJS**. It allows users to upload multiple files of any type (Images, PDFs, Documents) to an **S3-compatible bucket**. Unlike standard uploaders, this system tracks file metadata in a **PostgreSQL** database and provides a real-time UI to view, download, and specifically delete individual files.

### Key Features
* **Multi-File Upload**: Support for uploading several files (Signatures, Photos, IDs) in a single batch.
* **S3 Cloud Integration**: Files are stored securely in the cloud, not on the local server.
* **Presigned URLs**: Secure, time-limited links are generated dynamically for private file viewing.
* **Specific Deletion**: Users can delete a specific file from both the S3 bucket and the database without affecting other documents.
* **Dynamic UI**: A clean EJS-based dashboard that lists all active files in storage.
* **Automatic Formatting**: Integrated with Prettier and ESLint for clean, standardized code.

---

## 🛠️ Tech Stack
* **Backend**: NestJS (Node.js Framework)
* **Database**: PostgreSQL with TypeORM
* **Storage**: AWS S3 / DigitalOcean Spaces
* **Frontend**: EJS (Embedded JavaScript Templates)
* **File Handling**: Multer (Memory Storage)

---

## images


![1](https://i.ibb.co/vvmpXVTm/Screenshot-from-2026-03-23-18-34-15.png)


---


## 🚀 How It Works

### 1. File Upload
When a user selects files and clicks upload, the `FilesInterceptor` captures the buffers. The `FilesService` loops through each file, pushes it to S3, and saves the unique **S3 Key** and **Mimetype** into the database.

### 2. Viewing Files
The dashboard fetches all metadata from the database. For every file, the system requests a **Presigned URL** from S3, allowing the browser to display private files securely for a limited time.

### 3. Specific Cleanup
Each file has a dedicated "Delete" button. Clicking this triggers a dual-action process:
1.  The `DeleteObjectCommand` removes the physical file from the S3 Bucket.
2.  The TypeORM repository removes the metadata record from the PostgreSQL table.

---

## ⚙️ Setup & Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file with your S3 credentials (`ACCESS_KEY`, `SECRET_KEY`, `BUCKET_NAME`, `ENDPOINT`) and Database URL.
4.  **Run the application**:
    ```bash
    npm run start:dev
    ```
5.  **Access the UI**:
    Navigate to `http://localhost:4000/files/show`




<!-- <p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

<!-- ## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE). --> -->
