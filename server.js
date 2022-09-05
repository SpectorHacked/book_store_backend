const express = require('express'); //Line 1
const bodyParser = require('body-parser');
const app = express(); //Line 2
const port = 4000; //Line 3
app.use(bodyParser.urlencoded({ extended: true }));
let items = require('./data.json');
let users = require('./users.json')
let activities = require('./activity.json');
let emails = require('./emails.json');
let purchases = require('./purchases.json');
const { deleteItemFromStore, buildItem, addItem, fixArray, fixSingleBook, addUser, addActivity, addEmail, addPurchase } = require('./functions');
const PAGE_SIZE = 9
const LOGIN = 'LOGIN'
const REGISTER = 'REGISTER'

app.listen(port, () => console.log(`Listening on port ${port}`));

//////// App routes

app.get('/categories', (req, res) => {
  const set = new Set()
  items.forEach(e => {
    e.categories.filter(Boolean).forEach(d => {
      if(d !== undefined) {
        set.add(d)
      }
    })
  })
  res.status(200).send({data: Array.from(set)})
  return;
})

app.get('/get_one_by_isbn', (req, res) => {
  const result = items.find(item => item?.isbn == req.query.isbn)
  if(result === undefined) {
    res.status(201).send({data: "Nothing is found!"})
    return;
  } else {
    res.status(200).send({data: fixSingleBook(result)})
    return;
  }
})

app.get('/search', (req, res) => {
  let filterObject = {}
  if(req.query.filters) {
    filterObject = JSON.parse(req.query.filters)
  }
  const textSearch = req.query.search?.toLowerCase() || "";
  const skip = req.query.skip;
  const results = items.filter(item => {
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
  const skipNumber = parseInt(skip)
  let nextSkipNumber = 0
  if(filteredResultsByText.length > 9*(skipNumber-1)) {
    nextSkipNumber = parseInt(skip) + 1;
  }
  res.status(200).send({
    data: fixArray(filteredResultsByText.slice(skip*PAGE_SIZE, (skipNumber+1)*PAGE_SIZE)), 
    resultsLength: filteredResultsByText.length,
    skip: nextSkipNumber,
  })
  return;
})

app.get('/best-sellers', (req, res) => {
  console.log(req.query)
  const shuffled = items.filter(e => e.categories.includes(req.query.currentCategory[0]))
  .sort(() => 0.5 - Math.random());
  res.status(200).send({data: fixArray(shuffled.slice(0, 4))})
  return;
})

app.get('/log-event', async(req, res) => {
  const { userId, type } = req.query
  await addActivity(type, userId)
  res.status(200).send({data: "Success"})
})

app.get('/newspaper-add', async(req, res) => {
  const { email } = req.query
  if(!email) {
    res.status(201).send({data: "Something went wrong"})
    return;
  } else if (emails.includes(email)) {
    res.status(201).send({data: "Email already in the system"})
    return;
  }
  await addEmail(email)
  emails = [...emails, email]
  res.status(200).send({data: "Success"})
})

app.get('/submit-purchase', async(req, res) => {
  const { cart, userId } = req.query
  if(!cart || !userId) {
    res.status(201).send({data: "Something went wrong"})
    return;
  }
  const newPurchase = {
    userId,
    cart
  }
  purchases = await addPurchase(newPurchase)
  res.status(200).send({data: "Success"})
})

///////// Admin actions

app.get('/admin-get-activities', (req, res) => {
  activities = require('./activity.json')
  res.status(200).send({data: activities})
  return;
})

app.get('/admin-add-items', async(req, res) => {
  try {
    const newItem = buildItem(req.query.item)
    await addItem(newItem)
    res.status(200).send({data: newItem})
    return;
  } catch(e) {
    console.log(e)
    res.status(201).send({data: "Something went wrong"})
    return;
  }
})

app.get('/admin-remove-item', async(req, res) => {
  try {
    const isbn = req.query.isbn
    await deleteItemFromStore(isbn)
    res.status(200).send({data: "Deleted!"})
    return;
  } catch(e) {
    console.log(e)
    res.status(201).send({data: e})
    return;
  }
})

///////// User actions 


app.get('/login', async(req, res) => {
  const username = req.query.user;
  const password = req.query.pass;
  const result = users.find(item => item?.user?.toLowerCase() == username?.toLowerCase())
  if(!result) {
    res.status(201).send({data: "No username found"})
    return;
  }
  else if(result.pass !== password) {
    res.status(201).send({data: "Password does not match"})
    return;
  }
   else if(result === undefined) {
    res.status(201).send({data: "Something went wrong"})
    return;
  } else {
    await addActivity(LOGIN, result.id)
    res.status(200).send({data: result})
    return;
  }
})

app.get('/register', async(req, res) => {
  const user = req.query.user;
  const pass = req.query.pass;
  const name = req.query.fullname;
  if(!user || !pass || !name) {
    res.status(201).send({data: "Please fill all"})
    return;
  }
  const newUser = {
    id: users.length + 1,
    user,
    name,
    pass
  }
  try {
    await addActivity(REGISTER, newUser.id)
    users = await addUser(newUser)
    res.status(200).send({data: newUser})
    return;
  } catch(e) {
    console.log(e)
    res.status(201).send({data: "Something went wrong!"})
  }
})
