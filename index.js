const cors = require('cors');
const express = require('express');
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

async function run() {
    try {
        const contactsCollection = client.db('vouchDigital').collection('contacts');


        // to add a new contact.
        app.post('/contact', async (req, res) => {
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
        app.delete('/contact/:id', async (req, res) => {
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