// app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require('./routes/project.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use("/api/client", clientRoutes);
app.use('/api/project', projectRoutes);

module.exports = app;
