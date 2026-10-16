import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose-cjs";

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
const wishlistsCollection = db.collection("wishlists");

const JWKS = createRemoteJWKSet(new URL(`${process.env.Client_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ massage: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ massage: "Unauthorized" });
  }
  // console.log(token, "token");

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ massage: "Forbidden" });
  }
};

app.get("/", (req, res) => {
  res.send("Pet Adoption Backend is running!");
});
app.get("/pets", async (req, res) => {
  const result = await petsCollections.find().toArray();
  res.send(result);
});

app.get("/pets/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const pet = await petsCollections.findOne({ _id: new ObjectId(id) });
  res.send(pet);
});

app.get("/pets/user/:userId",verifyToken, async (req, res) => {
  const { userId } = req.params;
  const result = await petsCollections.find({ ownerId: userId }).toArray();
  res.send(result);
});

app.post("/pets",verifyToken ,async (req, res) => {
  const petData = req.body;
  // console.log(petData, "petData");
  const result = await petsCollections.insertOne(petData);
  res.send(result);
});

app.patch("/pets/update-pet/:id",verifyToken, async (req, res) => {
  const { id } = req.params;
  const updatedPet = req.body;
  console.log(updatedPet, "updatedpet");
  const result = await petsCollections.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedPet },
  );
  res.send(result);
});

app.delete("/pets/:id",verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  const result = await petsCollections.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.post("/adoption-requests",verifyToken, async (req, res) => {
  const requestedPetData = req.body;
  requestedPetData.requestDate = new Date();
  const result = await petsRequests.insertOne(requestedPetData);
  // console.log(result);
  res.send(result);
});
app.get("/adoption-requests/:userId",verifyToken, async (req, res) => {
  const { userId } = req.params;
  const result = await petsRequests.find({ userId }).toArray();
  console.log(result);
  res.send(result);
});
app.delete("/adoption-requests/:id",verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  const result = await petsRequests.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.post("/wishlist",verifyToken, async (req, res) => {
  try {
    const wishlistData = req.body;
    const { userId, petId } = wishlistData;
    if (!userId || !petId) {
      return res
        .status(400)
        .json({ message: "User ID and Pet ID are required" });
    }
    const existingPet = await wishlistsCollection.findOne({
      userId: String(userId),
      petId: String(petId),
    });
    if (existingPet) {
      return res
        .status(409)
        .json({ message: "Pet is already in your wishlist" });
    }
    const result = await wishlistsCollection.insertOne({
      ...wishlistData,
      userId: String(userId),
      petId: String(petId),
      createdAt: new Date(),
    });
    res
      .status(201)
      .json({ message: "Added to wishlist", insertedId: result.insertedId });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

app.get("/wishlist",verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const wishlist = await wishlistsCollection
      .find({ userId: String(userId) })
      .toArray();
    res.json(wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

app.delete("/wishlist/:petId",verifyToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const result = await wishlistsCollection.deleteOne({
      userId: String(userId),
      petId: String(petId),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Delete wishlist error:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

await client.connect();
console.log("MongoDB connected successfully");

export async function disconnectFromMongoDB() {
  await client.close();
}

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;