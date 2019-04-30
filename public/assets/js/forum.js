var auth = firebase.auth();
var db = firebase.firestore();

//=======================================================
//=================AUTHENTICATION========================
//=======================================================

function login(provider){
  if (provider == 'gmail') {
    var provider = new firebase.auth.GoogleAuthProvider();
  } else if (provider == 'facebook') {
    var provider = new firebase.auth.FacebookAuthProvider();
  }else if (provider == 'twitter') {
    var provider = new firebase.auth.TwitterAuthProvider();
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

var currentUser = null
auth.onAuthStateChanged(function(user){
  if(user){
    console.log('login...')
    currentUser = user

    checkForumOwner(user.uid)
    checkRepliesOwner(user.uid)
    toggleLogin()
  }else{
    console.log('logout...')
    toggleLogin()
  }
})

function toggleLogin(){
  document.getElementById('login-wrapper').classList.toggle("hidden");
  document.getElementById('logout-wrapper').classList.toggle("hidden");
}

//============================================================
//=================GENERAL====================================
//============================================================

function checkForumOwner(forum_owner_id){
  if(document.getElementById('owner-id').value == forum_owner_id){
    document.getElementById('edit-btn').classList.remove('hidden')
  }
}

function checkRepliesOwner(forum_owner_id){
  var elements = document.getElementsByClassName('replies-button')
  for (var i = 0; i < elements.length; i++) {
    if(elements[i].getAttribute('reply-owner-id') == forum_owner_id){
      elements[i].classList.remove('hidden')
    }

  }

}

//========================================================
//=====================FORUM==============================
//========================================================

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
    window.location = window.location.href + '/' +slug
  }).catch(function(eror){
    console.log('Forum failed to create!')
  });
}

function showEditForm(){
  document.getElementById('editForm').classList.remove('hidden')
}

function updateForum(id){
  db.collection('forums').doc(id).set({
    title: document.getElementById('newTitle').value,
    desc: document.getElementById('newDesc').value.replace("<br/>", "\n"),
    updated_at: new Date()
  }, {merge: true})
  .then(function(){
    console.log('update data successfully')
    location.reload()
  }).catch(function(error){
    console.log('update data failed')
    console.log(error)
  });
}

//============================================================
//=====================REPLY==================================
//============================================================

function addReply(id){
  var newReply = document.getElementById('replyBox').value;
  var forumsRef = db.collection('forums').doc(id)

  forumsRef.collection('replies').add({
    desc : newReply.replace("<br/>","\n"),
    created_at : new Date,
    updated_at : new Date,
    user: {
      user_id: currentUser.uid,
      name: currentUser.displayName
    }
  }).then(function(docRef){
    console.log('Reply successfully created!')
    location.reload()
  }).catch(function(eror){
    console.log('Reply failed to create!')
  });
}

var activeReplyId = '';
function editReply(replyId, prevDesc){
  activeReplyId = replyId
  //fill up textarea
  document.getElementById('replyEditBox').value = prevDesc

  // show form edit update
  document.getElementById('formEditReply').classList.remove('hidden')
}

function updateReply(){
  var forumId = document.getElementById('forum-id').value
  var newReply = document.getElementById('replyEditBox').value
  var dbRef = db.collection('forums').doc(forumId).collection('replies').doc(activeReplyId)

  dbRef.set({
    desc: newReply.replace("<br/>","\n"),
    updated_at: new Date()
  }, {merge:true})
  .then(function(docRef){
    console.log('Edit reply success!')
    location.reload()
  }).catch(function(eror){
    console.log('Edit reply failed!')
  });
}
