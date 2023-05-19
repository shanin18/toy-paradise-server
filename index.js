const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gacal02.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const toyCategoriesCollection = client
      .db("toyParadise")
      .collection("toyCategories");
    const allToyCollection = client.db("toyParadise").collection("allToys");

    app.get("/action_figure/:category", async (req, res) => {
      const category = req.params.category;
      const query = { subCategory: category };
      const options = {
        projection: { img: 1, title: 1, price: 1, ratings: 1 },
      };
      const result = await toyCategoriesCollection
        .find(query, options)
        .toArray();
      res.send(result);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCategoriesCollection.findOne(query);
      res.send(result);
    });

    app.get("/allToys", async (req, res) => {
      let query = {}
      const options = {
        projection: {
          sellerName: 1,
          title: 1,
          subCategory: 1,
          price: 1,
          availableQuantity: 1,
        },
      };
      const result = await allToyCollection.find(query, options).limit(20).toArray();
      console.log(result)
      res.send(result);
    });

    app.post("/allToys", async (req, res) => {
      const allToys = req.body;
      result = await allToyCollection.insertOne(allToys);
      res.send(result);
    });

    app.delete("/allToys/:id", async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allToyCollection.deleteOne(query);
      res.send(result);
    })
   
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

app.get("/", (req, res) => {
  res.send("toy paradise server running...");
});

app.listen(port, () => {
  console.log(`this server is running on port ${port}`);
});
