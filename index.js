const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const ObjectID = require('mongodb').ObjectID;
const app = express()
const path = require('path')
var admin = require("firebase-admin");
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 5055;
require('dotenv').config();

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjixa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// var serviceAccount = require("./dhakafreshfoods-firebase-adminsdk-h3leb-86f33fbfc9.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const firebaseAdminSdk = require('firebase-admin'),
    firebaseAdminApp = firebaseAdminSdk.initializeApp({
        credential: firebaseAdminSdk.credential.cert(
            JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii')))
    });

client.connect(err => {
    console.log(uri);
    console.log(err);
    const collection = client.db("dhakaFreshFood").collection("foodItems");
    const ordersCollection = client.db("dhakaFreshFood").collection("orders");
    app.post('/addProducts', (req, res) => {
        console.log(req.body);
        console.log('done');
        collection.insertOne(req.body)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                console.log('done');
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/', (req, res) => {
        collection.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })

    //placed By orders
    app.post('/productsByKeys', (req, res) => {
        const productKeys = req.body;
        console.log(productKeys);
        console.log(typeof (productKeys));
        collection.find({ name: { $in: productKeys } })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err);
            })
    })
    app.delete('/deleteProduct/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        collection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })
    app.delete('/deleteOrder', (req, res) => {
        const email = req.query.email;
        ordersCollection.findOneAndDelete({ email: email })
            .then(documents => res.send(!!documents.value))
    })
    //add order

    //manageProducts
    app.get('/manageProducts', (req, res) => {

        const bearer = req.headers.authorization;
        // console.log(bearer);
        if (bearer && bearer.startsWith('Bearer  ')) {
            console.log(bearer);
            const idToken = bearer.split('  ')[1];
            //console.log({ idToken });
            admin.auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    // ...
                    // console.log(tokenEmail);
                    // console.log(req.query.email);
                    if (tokenEmail === req.query.email) {
                        email = tokenEmail;
                        collection.find({ email }).toArray((err, documents) => {
                            res.send(documents);
                            console.log(documents);

                            // })
                        })
                    }
                    else {
                        res.status(401).send('Un-authorized Access');
                    }


                })
                .catch((error) => {
                    // Handle error
                    res.status(401).send('Un-authorized Access')
                });
        }
        else {
            res.status(401).send('Un-authorized Access');
        }
    });

    //get previous card
    app.get('/getProductsCard', (req, res) => {


        const email = req.query.email;
        ordersCollection.find({ email }).toArray((err, documents) => {
            res.send(documents);
            console.log(documents);

            // })
        })
    }




    );
})


    app.listen(port);
