const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cons = require('consolidate');
const app = express();

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://forum-4d67d.firebaseio.com"
});

const db = admin.firestore();

app.engine('hbs', cons.handlebars);
app.set('view engine','hbs');
app.set('views','./views');

app.get('/forum', function(req, res){
  var forums = []

  db.collection('forums').orderBy('updated_at','desc').get()
    .then(snapshoot => {
      snapshoot.forEach(doc => {
        forums.push(doc.data())
      })

      res.render('forum', {forums: forums});

    }).catch(err => {
      console.log('failed load data')
      console.log(err)
    })
})

app.get('/forum/:slug', function(req, res){

  var forum = null

  db.collection('forums').where('slug','==',req.params.slug).get()
    .then(snapshoot => {
      snapshoot.forEach(doc => {
        forum = doc.data()
        forum.id = doc.id
      })

      res.render('forum-single', {forum: forum});

    }).catch(err => {
      console.log('failed load data')
      console.log(err)
    })
})
exports.app = functions.https.onRequest(app);
