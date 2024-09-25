require('dotenv').config()

const express = require('express')
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')
const cors = require('cors')

// init app & middleware
const app = express()
app.use(express.json())
app.use(cors());
//app.use(bodyParser.json())

// db cpmmectopm
let db

//debug toggle
const debug = true

connectToDb((err) => {
    if(!err){
        app.listen(3000, () => {
            console.log('App listening on port 3000')
        })
        db = getDb() //Returns database object
    }
})

// routes
app.get('/user_configs', (req, res) => {
    let books = []
    db.collection('user_configs')
        .find() //Returns a cursor: Can use -> toArray and forEach
        .sort({ author: 1 })
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
            if(debug == true){
                console.log("GET MULTI")
            }
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the document(s)'})
        })

})


//Get request
app.get('/user_configs/:id', (req, res) => {
    //Handles when the id paramter isn't valid
    if(ObjectId.isValid(req.params.id)) {
        db.collection('user_configs')
        .findOne({_id: new ObjectId(req.params.id)})
        .then(doc => {
            res.status(200).json(doc)
            if(debug == true){
                console.log("GET SINGLE")
            }
        })
        .catch(err => {
            res.status(500).json({error: 'Could not fetch the document(s)'})
        })
    } else {
        res.status(500).json({error: 'Not a valid document id'})
    }
})

//Post request
app.post('/user_configs', (req, res) => {
    const book = req.body
    db.collection('user_configs')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
            if(debug == true){
                console.log("GET POST")
            }
        })
        .catch(err => {
            res.status(500).json({error: 'Could not create a new document'})
        })
})

//Delete request
app.delete('/user_configs/:id', (req, res) => {
    if(ObjectId.isValid(req.params.id)) {
        db.collection('user_configs')
        .deleteOne({_id: new ObjectId(req.params.id)})
        .then(result => {
            res.status(200).json(result)
            if(debug == true){
                console.log("GET DELETE")
            }
        })
        .catch(err => {
            res.status(500).json({error: 'Could not delete the document(s)'})
        })
    } else {
        res.status(500).json({error: 'Not a valid document id'})
    }
})

//Patch request -> Used to update fields
app.patch('/user_configs/:id', (req, res) => {
    const updates = req.body
    //Checks if the passed id is valid
    if(ObjectId.isValid(req.params.id)) {
        db.collection('user_configs')
        .updateOne({_id: new ObjectId(req.params.id)}, {$set: updates})
        .then(result => {
            res.status(200).json(result)
            if(debug == true){
                console.log("GET PATCH")
            }
        })
        .catch(err => {
            res.status(500).json({error: 'Could not update the document(s)'})
        })
    } else {
        res.status(500).json({error: 'Not a valid document id'})
    }
})

//Get request from Google OAuth2.0
app.get('/user_info/:')

// //Patch request -> Used to update a specific period
// app.patch('user_configs/:id/:period', (req, res) => {
//     const updates = req.body
//     //Checks if the passed id is valid
//     if(ObjectId.isValid(req.params.id)) {
//         db.collection('user_configs')
//         .updateOne({_id: new ObjectId(req.params.id)}, 
//                     { $set: {"period.$[label]" : updates} }, //Sets period to the updated value
//                     { arrayFilters: [{"label" : req.params.period}]})
//         .then(result => {
//             res.status(200).json(result)
//             if(debug == true){
//                 console.log("GET PATCH")
//             }
//         })
//         .catch(err => {
//             res.status(500).json({error: 'Could not update the document(s)'})
//         })
//     } else {
//         res.status(500).json({error: 'Not a valid document id'})
//     }         
// })

