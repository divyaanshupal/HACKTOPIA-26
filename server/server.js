const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = require('./app');




const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDb Connected")
  app.listen(port, () => {
    console.log(`Server started on port ${port} .....`);
  });
})

