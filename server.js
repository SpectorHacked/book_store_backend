const express = require('express'); //Line 1
const bodyParser = require('body-parser');
const app = express(); //Line 2
const port = 4000; //Line 3
app.use(bodyParser.urlencoded({ extended: true }));
const data = require('./data.json');

const PAGE_SIZE = 9
const users = [
  {
    id: "1",
    user: "test",
    pass:"12345678",
    name:"Erel Biran"
  },
  {
    id: "2",
    user: "admin",
    pass:"admin",
    name:"Admin"
  },
]
const DEFAULT_SHORT_DESC = "Unlocking Android: A Developer's Guide provides concise, hands-on instruction for the Android operating system and development tools. This book teaches important architectural concepts in a straightforward writing style and builds on this with practical and useful examples throughout."
const DEFAULT_URL = "https://s3.amazonaws.com/AKIAJC5RLADLUMVRPFDQ.book-thumb-images/ableson.jpg"


// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

app.get('/categories', (req, res) => {
  const set = new Set()
  data.forEach(e => {
    e.categories.filter(Boolean).forEach(d => {
      if(d !== undefined) {
        set.add(d)
      }
    })
  })
  res.status(200).send({data: Array.from(set)})
  return;
})

app.get('/login', (req, res) => {
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
    res.status(200).send({data: result})
    return;
  }
})

app.get('/register', (req, res) => {
  const user = req.query.user;
  const pass = req.query.pass;
  const name = req.query.fullname;
  if(!user || !pass || !name) {
    res.status(301).send({data: "Please fill all"})
    return;
  }
  users.push({
    id: users.length + 1,
    user,
    name,
    pass
  })
  res.status(200).send({data: results[0]})
  return;
})

app.get('/get_one_by_isbn', (req, res) => {
  const result = data.find(item => item?.isbn == req.query.isbn)
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
  const shuffled = data.sort(() => 0.5 - Math.random());
  res.status(200).send({data: fixArray(shuffled.slice(0, 4))})
  return;
})

function fixArray(arr) {
  if(Array.isArray(arr)) {
    return (arr).map(e => {
      return fixSingleBook(e);
    })
  } else {
    return []
  }
}

function fixSingleBook(book) {
  if(!book.shortDescription) {
    book.shortDescription = DEFAULT_SHORT_DESC
  }
  if(!book.thumbnailUrl) {
    book.thumbnailUrl = DEFAULT_URL
  }
  return book;
}
