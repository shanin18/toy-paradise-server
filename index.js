const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
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

    // getting data using sub-category
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

    // getting single data using sub-category id
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCategoriesCollection.findOne(query);
      res.send(result);
    });

    // getting data for all toys
    app.get("/allToys", async (req, res) => {
      let query = {};
      const options = {
        projection: {
          sellerName: 1,
          title: 1,
          subCategory: 1,
          price: 1,
          availableQuantity: 1,
        },
      };
      const result = await allToyCollection
        .find(query, options)
        .limit(20)
        .toArray();
      res.send(result);
    });

    // Creating index on title field
    const indexKey = { title: 1 };
    await allToyCollection.createIndex(indexKey);

    // getting data using indexing on allToys
    app.get("/searchByToy/:text", async (req, res) => {
      const text = req.params.text;
      const result = await allToyCollection
        .find({ title: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // getting single data from all toys
    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.findOne(query);
      res.send(result);
    });

    // getting my toys data from all toys using email
    app.get("/myToys", async (req, res) => {
      let query = {};
      let options = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
        if (req.query.sort === "increasing") {
          options = { price: 1 };
        } else if (req.query.sort === "decreasing") {
          options = { price: -1 };
        }
      }
      const result = await allToyCollection.find(query).sort(options).toArray();
      res.send(result);
    });

    // getting single data for set to default value on update form
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.findOne(query);
      res.send(result);
    });

    // adding data to all toys
    app.post("/allToys", async (req, res) => {
      const data = req.body;
      const result = await allToyCollection.insertOne(data);
      res.send(result);
    });

    // updating single data from all toys
    app.put("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const body = req.body;
      const updateDoc = {
        $set: {
          img: body.img,
          title: body.title,
          price: body.price,
          ratings: body.ratings,
          availableQuantity: body.availableQuantity,
          sellerName: body.sellerName,
          sellerEmail: body.sellerEmail,
          subCategory: body.subCategory,
          description: body.description,
        },
      };

      const result = await allToyCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete single data from all toys
    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToyCollection.deleteOne(query);
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

app.get("/", (req, res) => {
  res.send("toy paradise server running...");
});

app.listen(port, () => {
  console.log(`this server is running on port ${port}`);
});
