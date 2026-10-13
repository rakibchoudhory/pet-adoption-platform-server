import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("Pets-Adoption");
const petsCollections = db.collection("pets");
const petsRequests = db.collection("petsRequests");

export async function connectToMongoDB() {
  await client.connect();

  console.log("You successfully connected to MongoDB!");

  return client;
}

export async function disconnectFromMongoDB() {
  await client.close();
}

app.get("/", (req, res) => {
  res.send("Pet Adoption Backend is running!");
});
app.get("/pets", async (req, res) => {
  const result = await petsCollections.find().toArray();
  res.send(result);
});
app.get("/pets/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id, "id");
  const pet = await petsCollections.findOne({ _id: new ObjectId(id) });
  res.send(pet);
});

app.get("/pets/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const result = await petsCollections.find({ ownerId: userId }).toArray();
  res.send(result);
});

app.post("/pets", async (req, res) => {
  const petData = req.body;
  console.log(petData, "petData");
  const result = await petsCollections.insertOne(petData);
  res.send(result);
});

app.patch("/pets/update-pet/:id", async (req, res) => {
  const { id } = req.params;
  const updatedPet = req.body;
  console.log(updatedPet, "updatedpet");
  const result = await petsCollections.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedPet },
  );
  res.send(result);
});

app.delete("/pets/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id ,'id');
  const result = await petsCollections.deleteOne({_id: new ObjectId(id)});
  res.send(result);
});

app.post("/adoption-requests", async (req, res) => {
  const requestedPetData = req.body;
  requestedPetData.requestDate = new Date();
  const result = await petsRequests.insertOne(requestedPetData);
  // console.log(result);
  res.send(result);
});
app.get ("/adoption-requests/:userId", async(req,res) => {
  const {userId} = req.params;
  const result = await petsRequests.find({userId}).toArray();
  console.log(result);
  res.send(result);
})
app.delete("/adoption-requests/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id ,'id');
  const result = await petsRequests.deleteOne({_id: new ObjectId(id)});
  res.send(result);
});

async function startServer() {
  try {
    await connectToMongoDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error);
    process.exit(1);
  }
}
startServer();
