
const fs = require('fs')

const DEFAULT_SHORT_DESC = "Unlocking Android: A Developer's Guide provides concise, hands-on instruction for the Android operating system and development tools. This book teaches important architectural concepts in a straightforward writing style and builds on this with practical and useful examples throughout."
const DEFAULT_URL = "https://s3.amazonaws.com/AKIAJC5RLADLUMVRPFDQ.book-thumb-images/ableson.jpg"

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
    if(!book.pageCount) {
        book.pageCount = Math.floor((Math.random() * (901))+ 100)
    }
    
    return book;
}

async function rewriteFile(fileRef, objectToAdd) {
    let currnetFile;
    try {
        currnetFile = JSON.parse(await fs.readFileSync(fileRef, 'utf8'))
        currnetFile.push(objectToAdd)
        await fs.writeFileSync(fileRef, JSON.stringify(currnetFile, null, 2))
        return Promise.resolve(currnetFile)
    } catch(e) {
        console.log(e)
        return Promise.reject(currnetFile)
    }
}

async function deleteItemFromStore(isbn) {
    let currnetFile;
    try {
        currnetFile = JSON.parse(await fs.readFileSync('./data.json', 'utf8'))
        const deletedItem = currnetFile.find(e => e.isbn == isbn)
        cons
        if(!deletedItem) {
        throw Error("wrong isbn")
        }
        const newFile = currnetFile.filter(e => e.isbn !== isbn)
        await fs.writeFileSync('./data.json', JSON.stringify(newFile, null, 2))
        data = [...newFile]
        return Promise.resolve(newFile)
    } catch(e) {
        console.log(e)
        throw Error(e)
    }
}

async function addActivity(type, id) {
    const time = new Date()
    const activity = { type, id, time }
    await rewriteFile('./activity.json', activity)
}

async function addEmail(email) {
    await rewriteFile('./emails.json', email)
}
async function addUser(newUserObject) {
    await rewriteFile('./users.json', newUserObject)
}

async function addItem(itemToAdd) {
    await rewriteFile('./data.json', itemToAdd) 
}

async function addPurchase(newPurchase) {
    await rewriteFile('./purchases.json', newPurchase) 
}


function buildItem(item) {
    item.isbn = parseInt((new Date().getTime()/1000).toFixed(0))
    return item;
}
  
module.exports = { fixArray, fixSingleBook, rewriteFile, deleteItemFromStore, addActivity, addUser, addItem, addEmail, addPurchase, buildItem}