const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cons = require('consolidate');
const hbs = require('express-handlebars');
const app = express();

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://forum-4d67d.firebaseio.com"
});

const db = admin.firestore();

// app.engine('hbs', cons.handlebars);
app.engine('hbs', hbs({
  extname: 'hbs',
  partialsDir:  __dirname + '/views/partials'
}))
app.set('view engine','hbs');
app.set('views','./views');

app.get('/forum', function(req, res){
  var forums = []

  db.collection('forums').orderBy('created_at','desc').limit(2).get()
    .then(snapshoot => {
      snapshoot.forEach(doc => {
        forums.push(doc.data())
      })

      var lastItem = forums[forums.length -1]

      res.render('forum', {forums: forums, lastBlogTime: Date.parse(lastItem.created_at)});

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

      //load replies
      var replies = [];
      db.collection('forums').doc(forum.id).collection('replies')
        .orderBy('created_at','desc').get()
          .then(snapshoot => {
            snapshoot.forEach(doc => {
              replies.push({
                data: doc.data(),
                id: doc.id
              })
            })

            res.render('forum-single', {forum: forum, replies: replies});
          }).catch(err => {
            console.log('failed load data')
            console.log(err)
          })

    }).catch(err => {
      console.log('failed load data')
      console.log(err)
    })
})

app.get('/forum/older/:lastTime', function(req, res){
  var forums = []
  var lastTime = new Date(parseInt(req.params.lastTime))

  db.collection('forums').where('created_at','<',lastTime)
    .orderBy('created_at','desc').limit(2).get()
    .then(snapshoot => {
      snapshoot.forEach(doc => {
        forums.push(doc.data())
      })

      var lastItem = forums[forums.length -1]

      res.render('forum', {forums: forums, lastBlogTime: Date.parse(lastItem.created_at)});

    }).catch(err => {
      console.log('failed load data')
      console.log(err)
      res.render('forum-empty')
    })
})

exports.app = functions.https.onRequest(app);
