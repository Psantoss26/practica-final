// app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require('./routes/project.routes');
const deliveryNoteRoutes = require('./routes/deliveryNote.routes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use("/api/client", clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);

app.use('/firmas', express.static(path.join(__dirname, 'firmas')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

module.exports = app;
