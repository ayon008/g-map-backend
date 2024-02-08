var express = require('express')
var cors = require('cors')
require('dotenv').config()
var app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server running')
})

const uri = "mongodb+srv://afsrun771:2f3le4QqQlcifPLL@cluster0.gdhe0uf.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const dataBase = client.db('afsRun')
        const userCollection = dataBase.collection('users');

        app.post('/users', async (req, res) => {
            const data = req.body;
            const result = await userCollection.insertOne(data);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const data = await userCollection.find().toArray()
            res.send(data);
        })

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { uid: { $eq: id } }
            const data = await userCollection.findOne(query)
            res.send(data)
        })

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { uid: { $eq: id } }
            const options = { upsert: true }
            const data = req.body;
            const updatedData = {
                $set: {
                    email: data.email,
                    name: data.name,
                    surName: data.surName,
                    userName: data.userName,
                    region: data.region
                }
            }
            const result = await userCollection.updateOne(query, updatedData, options)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(port);
})