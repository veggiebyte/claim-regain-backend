const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

const testJwtRouter = require('./controllers/test-jwt');
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const foundItemsRouter = require('./controllers/founditems.js');
const claimsRouter = require('./controllers/claims.js');


app.use('/auth', authRouter);
app.use('/test-jwt', testJwtRouter);
app.use('/users', usersRouter);
app.use('/founditems', foundItemsRouter);
app.use('/claims', claimsRouter);

app.listen(PORT, () => {
  console.log('The express app is ready!');
});