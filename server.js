require('dotenv').config()
const express = require('express')
// const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./autogened-swagger.json');
const cors = require('cors');
const dbConnection = require('./models/dbConnection');
const adminRoutes = require('./routes/admin.routes');
const voterRoutes = require('./routes/voter.routes');

const port = process.env.SERVER_PORT || 5000;
app.use(cookieParser())
app.use(express.json());
app.use(cors());
app.use(adminRoutes)
app.use(voterRoutes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
dbConnection()