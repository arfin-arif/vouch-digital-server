const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

//middle ware 
app.use(cors())
app.use(express.json());

// mDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qktvmdh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    // console.log(req.headers.authorization);
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Unauthorized');
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'access forbidden ' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const contactsCollection = client.db('vouchDigital').collection('contacts');
        // to add a new contact.
        app.post('/contact', verifyJWT, async (req, res) => {
            const contact = req.body;
            const result = await contactsCollection.insertOne(contact)
            res.send(result)
        })


        // to get  a single  contact data
        app.get('/contact/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const contact = await contactsCollection.findOne(query)
            res.send(contact)
        })
        // Fetch phase matching results

        // to get particular user products

        app.get('/contacts-by-email', async (req, res) => {
            let query = {};
            if (req.query.userEmail) {
                query = {
                    userEmail: req.query.userEmail
                }
            }
            const cursor = contactsCollection.find(query)
            const contacts = await cursor.toArray();
            res.send(contacts)
        })

        // list of contacts with pagination
        app.get('/contact-by-page', verifyJWT, async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size)
            // console.log(page, size)
            const query = {};
            const cursor = contactsCollection.find(query);
            const contacts = await cursor.skip(page * size).limit(size).toArray()
            const count = await contactsCollection.estimatedDocumentCount()
            res.send({ count, contacts: contacts })
        })


        //to  update given contact
        app.put('/contact/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const contact = req.body;
            console.log(contact)
            const option = { upsert: true };
            const updatedContact = {
                $set: {

                    userName: contact.name,
                    email: contact.email,
                    address: contact.address,
                    phone: contact.phone
                }
            }
            const results = await contactsCollection.updateOne(query, updatedContact, option)
            res.send(results)
        });


        // to delete any given contact
        app.delete('/contact/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await contactsCollection.deleteOne(query);
            res.send(result)
        })





    }
    finally {

    }
}
run().catch(error => console.log(error))



app.get('/', (req, res) => {
    res.send('Vouch Digital Server Is Running')
});
app.listen(port, () => {
    console.log(`Vouch Digital Server running on port ${port}`)
})