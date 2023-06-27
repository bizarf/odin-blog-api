# The Odin Project - Project: Blog API

The goal of this project is to make an REST API which will be used for a blog client and blog CMS.

-   [View the live site here](link goes here)
-   [View the blog client repo](link goes here)
-   [View the blog CMS repo](link goes here)

#### Install:

To run this project on your local server, first install the dependencies with the command:

```
npm install
```

Next you will need to create a ".env" file at the root of the project. You will now need to create a database on MongoDB Atlas. Inside the ".env" file replace the end string with your database's connection string.

```
MONGODB_KEY="AMONGODBATLASKEY"
JWT_SECRET="AJWTSECRETKEY"
```

After that is done, you can start the server with:

```
npm start
```

<hr>

##### Tools and technologies used:

-   Express Generator
-   Dotenv
-   Mongoose
-   BCrypt JS
-   Passport
-   Jsonwebtoken
