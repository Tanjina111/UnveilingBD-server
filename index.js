const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.12a1y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        // Database For All Books
        const database = client.db('all_books');
        const booksCollection = database.collection('books');

        // Database For Ordered Books
        const databaseOrder = client.db('ordered_books');
        const orderCollection = databaseOrder.collection('allOrderedBooks');

        // Database For Review
        const databaseReview = client.db('reviews');
        const reviewCollection = databaseReview.collection('allReviews');

        // Database For Users
        const databaseUser = client.db('users');
        const userCollection = databaseUser.collection('allUsers');
    
        console.log('connected');

        //Get API For Books
        app.get('/allBooks', async (req, res) => {
            const cursor = booksCollection.find({});
            const books = await cursor.toArray();
            res.send(books);
        })

        // Get Data By Keys
        app.get('/allBooks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const books = await booksCollection.findOne(query);
            res.send(books);
        });

         // Get Data By Email
         app.get("/orders", async (req, res) => {
            const mail = req.query.email;
            console.log(mail);
            let query = {};
            if(mail){
                query = { email: mail }
            }
            const orders =  orderCollection.find( query );
            const result = await orders.toArray();
            res.json(result);
        });

        // Orders placed
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        // Add Book
        app.post("/allBooks", async (req, res) => {
            const service = req.body;
            const result = await booksCollection.insertOne(service);
            res.json(result);
        });

        // Manage Orders
        app.get("/manageorders", async (req, res) => {
            const manageOrder = await orderCollection.find({}).toArray();
            res.send(manageOrder);
        });

        // Delete Order
        app.delete("/orders/:id", async (req, res) => {
            const orderId = req.params.id;
            const query = { _id: ObjectId(orderId) };
            const orderDelete = await orderCollection.deleteOne(query);
            res.json(orderDelete);
        });

        // // Update Order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: updateStatus.status,
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        //Get API For Review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })

        // Add Review
        app.post("/review", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        // Manage Books
        app.get("/manageBooks", async (req, res) => {
            const manageBooks = await booksCollection.find({}).toArray();
            res.send(manageBooks);
        });

         // Delete Books
         app.delete("/allBooks/:id", async (req, res) => {
            const orderId = req.params.id;
            const query = { _id: ObjectId(orderId) };
            const bookDelete = await booksCollection.deleteOne(query);
            res.json(bookDelete);
        });

        // User API
        app.post('/user', async(req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
        
        // Set Admin
        app.put('/user/admin', async(req, res) => {
            const user = req.body;
            const filter = { email : user.email };
            const updateDoc = { $set : {role : 'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // Admin API
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email : email};
            const users = await userCollection.findOne( query );
            let isAdmin = false;
            if(users?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin : isAdmin});
        });

        // User API For Google Sign In
        app.put('/user', async(req, res) => {
            const user = req.body;
            const filter = { email : user.email };
            const options = {upsert : true};
            const updateDoc = { $set : user};
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})