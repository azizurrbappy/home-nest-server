const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running...');
});

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@homenest.5up5fq1.mongodb.net/?appName=HomeNest`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    const db = client.db('home-nest');
    const propertiesCollection = db.collection('properties');
    const usersCollection = db.collection('users');

    // All apis endpoints
    app.get('/properties', async (req, res) => {
      const cursor = propertiesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/properties', async (req, res) => {
      const newProperty = req.body;
      const result = await propertiesCollection.insertOne(newProperty);
      res.send(result);
    });

    app.get('/featuredrealestate', async (req, res) => {
      const cursor = propertiesCollection.find().sort({ postedDate: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/property/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    // USERS Api
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({ message: 'User credentials already exist.' });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
