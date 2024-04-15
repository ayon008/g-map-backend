var express = require('express')
var nodemailer = require('nodemailer')
var jwt = require('jsonwebtoken')
require('dotenv').config()
var cors = require('cors')
var app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@cluster0.gdhe0uf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



// VERIFY TOKENS
const verify = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        // return res.status(401).send({ error: true }, 'unauthorized access')
        return res.send(401, { error: true }, 'unauthorized access');
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            return res.send({ error: true, message: 'unauthorized access' })
        }
        else {
            req.decoded = decoded;
            next()
        }
    })
}


app.get('/', (req, res) => {
    res.send('server running')
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const dataBase = client.db('afsRun')
        // user Database
        const userCollection = dataBase.collection('users');
        // Runs Database
        const runsCollection = dataBase.collection('allRuns');

        // Upload User
        app.post('/users', async (req, res) => {
            const data = req.body;
            const query = { email: { $eq: data?.email } }
            const find = await userCollection.findOne(query);
            if (find) {
                return res.send({ message: 'user already added' })
            }
            const result = await userCollection.insertOne(data);
            res.send(result);
        })

        // get all users
        app.get('/users', async (req, res) => {
            const data = await userCollection.find().toArray()
            res.send(data);
        })

        // GET SPECIFIC USERS
        // app.get('/users/:id', verify, async (req, res) => {
        //     const id = req.params.id;
        //     const query = { uid: { $eq: id } };
        //     const decoded = req.decoded;
        //     const data = await userCollection.findOne(query);
        //     console.log(data, id);
        //     if (data?.email === decoded.email) {
        //         res.send(data)
        //     }
        // })


        // UPDATE USER INFORMATIONS
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


        // UPLOAD RUNS
        app.post('/allRuns', async (req, res) => {
            const data = req.body;
            const result = await runsCollection.insertOne(data)
            res.send(result)
        })


        // GET ALL RUNS
        app.get('/allRuns', async (req, res) => {
            const result = await runsCollection.find().toArray()
            res.send(result)
        })


        // GENERATE TOKEN FOR USERS
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1hr' })
            res.send({ token })
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
    console.log('Afs run is running', port);
})