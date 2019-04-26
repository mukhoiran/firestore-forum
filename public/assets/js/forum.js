var auth = firebase.auth();
var db = firebase.firestore();

function login(provider){
  switch (provider) {
    case 'gmail':
      var provider = new firebase.auth.GoogleAuthProvider();
    case 'facebook':
      var provider = new firebase.auth.FacebookAuthProvider();
    case 'twitter':
      var provider = new firebase.auth.TwitterAuthProvider();
    default:
  }

  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
    console.log('login success');

    //is user exist?
    //1. do nothing
    //2. insert to database
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if(doc.exists){
          console.log('already registered')
        }else{
          db.collection('users').doc(user.uid).set({
            name: user.displayName
          }).then(function(docRef){
            console.log('register successfully')
          }).catch(function(error){
            console.log('register failed')
          })
        }
      });

  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log('failed login');
  });
}

function logout(){
  auth.signOut().then(function(){
    console.log('logout success!');
  }).catch(function(err){
    console.log('logout failed');
  })
}

function addForum(){
  var newTitle = document.getElementById('newTitle').value;
  var newDesc = document.getElementById('newDesc').value;
  var slug = newTitle.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');

  db.collection('forums').add({
    title : newTitle,
    slug : slug,
    desc : newDesc.replace("<br/>","\n"),
    created_at : new Date,
    updated_at : new Date,
    user: {
      user_id: currentUser.uid,
      name: currentUser.displayName
    }
  }).then(function(docRef){
    console.log('Forum successfully created!')
  }).catch(function(eror){
    console.log('Forum failed to create!')
  });
}

var currentUser = null
auth.onAuthStateChanged(function(user){
  if(user){
    console.log('login...')
    currentUser = user
  }else{
    console.log('logout...')
  }
})
