const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tuu4iju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");

    app.get("/", (req, res) => {
      res.send("coffee data server is running");
    });

    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const coffees = await cursor.toArray();
      res.send(coffees);
    });
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      res.send(coffee);
    });

    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const coffeeInfo = req.body;
      console.log(coffeeInfo)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCoffee = {
        $set: {
          coffee: coffeeInfo.coffee,
          quantity: coffeeInfo.quantity,
          supplier: coffeeInfo.supplier,
          taste: coffeeInfo.taste,
          category: coffeeInfo.category,
          details: coffeeInfo.details,
          photoUrl: coffeeInfo.photoUrl,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffee,
        options
      );
      res.send(result);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      // console.log(newCoffee);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Coffee server listening on port ${port}`);
});
