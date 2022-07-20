const express = require('express'); //Line 1
// const { data } = require('./data');
const app = express(); //Line 2
const port = process.env.PORT || 4000; //Line 3

const data = require('./data')

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6


app.get('/search', (req, res) => {
  
})

// create a GET route
app.get('/express_backend', (req, res) => { //Line 9
  res.send({payload: data[0]}) //Line 10
}); //Line 11

