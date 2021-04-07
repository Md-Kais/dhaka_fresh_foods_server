const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectID;
const app = express()
var admin = require("firebase-admin");
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 5055;
require('dotenv').config();

app.use(cors())
app.use(bodyParser.json())


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
    app.post('/addProducts', (req, res) => {
        console.log(req.body);
        console.log('done');
        collection.insertOne(req.body)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/', (req, res) => {
        collection.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })
    //manageProducts
    app.get('/manageProducts', (req, res) => {

        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer  ')) {
            console.log(bearer);
            const idToken = bearer.split('  ')[1];
            console.log({ idToken });
            admin.auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    // ...
                    console.log(tokenEmail);
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
});




app.listen(port);
