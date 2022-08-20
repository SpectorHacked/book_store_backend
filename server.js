const express = require('express'); //Line 1
const bodyParser = require('body-parser');
const app = express(); //Line 2
const port = process.env.PORT || 4000; //Line 3
app.use(bodyParser.urlencoded({ extended: true }));
const data = require('./data.json');


const users = [
  {
    id: "123",
    email: "test",
    pass:"12345678"
  }
]
// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

app.get('/login', (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  const results = users.find(item => item.email.toLowerCase() == username.toLowerCase())
  if(!results.length) {
    res.status(301).send({data: "No username found"})
    return
  }
  if(results[0].password !== password) {
    res.status(302).send({data: "Password does not match"})
    return
  }
  res.status(200).send({id: results[0]})
  return;
})

app.get('/get_one_by_isbn', (req, res) => {
  const results = data.filter(item => item?.isbn == req.query.isbn)
  res.status(200).send({data: results})
  return;
})

app.get('/search', (req, res) => {
  const filterObject = JSON.parse(req.query.filters)
  const textSearch = req.query.search?.toLowerCase() || "";
  const results = data.filter(item => {
    return Object.keys(filterObject).every(filterKey => {
     const currentFilterValueArray = filterObject[filterKey]
     const currentItemFilterValue = item[filterKey]
     if(Array.isArray(currentItemFilterValue)) {
      return currentItemFilterValue && currentFilterValueArray.some(value => currentItemFilterValue.includes(value))
     } else {
      return currentItemFilterValue && currentFilterValueArray.includes(currentItemFilterValue)
     }
    }) 
  })
  let filteredResultsByText = [...results];
  if(textSearch.length > 0) {
    filteredResultsByText = results.filter(item => item.title.toLowerCase().includes(textSearch))
  }
  res.status(200).send({data: filteredResultsByText.slice(0, 9)})
  return;
})
