const cors = require("cors");
const express = require("express");
const { json } = require("express");
const dotenv = require("dotenv");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const app = express();
const port = 5000;
dotenv.config();

app.use(json());
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.ua8ibx3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.connect();
    const productCollection = client.db("Pc_Builder").collection("product");
    const pcBuildCollection = client.db("Pc_Builder").collection("build");

    app.get("/product", async (req, res) => {
      const product = await productCollection.find().toArray();
      res.send(product);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(filter);
      if (!product) {
        // Handle the case when the product is not found
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    });

    app.post("/build", async (req, res) => {
      const data = req.body;
      const result = await pcBuildCollection.insertOne(data);
      res.send(result);
    });
    app.delete("/build/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const DeleteProduct = { _id: new ObjectId(id) };
        const result = await pcBuildCollection.deleteOne(DeleteProduct);

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/build-product/:email", async (req, res) => {
      const email = req?.params?.email;
      const filter = { email: email };
      const product = await pcBuildCollection.find(filter).toArray();
      if (!product || product.length === 0) {
        // Handle the case when no product is found
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    });
  } catch (err) {
    console.log(err);
  }
}
//   hello world
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
