const express=require('express')
const bodyParser=require('body-parser')
const cors = require('cors')
const ObjectId=require('mongodb').ObjectID;
const app = express()
const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 5055;
require('dotenv').config();
  
app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjixa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(uri);
    console.log(err);
    const collection = client.db("dhakaFreshFood").collection("foodItems");
    app.post('/addProducts',(req,res)=>{
            console.log(req.body);
            console.log('done');
            collection.insertOne(req.body)
            .then(result=>{
                console.log(result);
               res.send(result.insertedCount > 0);
            })
        })
    app.get('/',(req,res)=>{
            collection.find()
            .toArray((err,items)=>{
                res.send(items);
            })
    })
});




app.listen(port);
