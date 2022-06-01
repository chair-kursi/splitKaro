const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const port = 4000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//IMPORTING ROUTES
const groupRouter = require("./routes/group");

//USING ROUTES AS MIDDLEWARE
app.use("/", groupRouter);

app.listen(port, function(err){
    if(err)console.log("Error connecting to port: " + port + "error: " + err);
    else console.log("App listening to port: " + port);
});