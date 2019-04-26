var db = firebase.firestore();

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
