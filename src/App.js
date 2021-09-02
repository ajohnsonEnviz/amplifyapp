import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {API, Storage} from 'aws-amplify';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react'
import {listTodos} from './graphql/queries';
import {createTodo as createNoteMutation, deleteTodo as deleteNoteMutation} from './graphql/mutations';


const initialFormState = {name:'', description:''}

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

useEffect(() =>{
fetchNotes();
},[]);

async function fetchNotes(){
  const apiData = await API.graphql({query : listTodos});
  const notesFromAPI = apiData.data.listTodos.items;
  await Promise.all(notesFromAPI.map(async note =>
    {
      if(note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
  
  setNotes(apiData.data.listTodos.items);

}

async function createNote(){
  if(!formData.name || !formData.description) return;
  await API.graphql({query:createNoteMutation, variables:{input: formData}});
  if(formData.image){
    const image = await Storage.get(formData.image);
    formData.image = image;
  }
  
  setNotes([formData, ...notes]);
  setFormData(initialFormState);
}

async function deleteNote({id}){
  const newNotesArray = notes.filter(note => note.id !== id);
  setNotes(newNotesArray);
  await API.graphql({query : deleteNoteMutation, variables:{input:{id}}});

}


async function onChange(e){
  if(!e.target.files[0]) return;
  const file = e.target.files[0];
  setFormData({...formData, image: file.name});
  await Storage.put(file.name,file);
  fetchNotes();
}
  return (
    <div className="App">
<div style={{width:'100%',textAlign:'right-end'}} >  <div style={{width:'200px'}}> <AmplifySignOut  /></div></div>

      <h1>My Notes App</h1>
      <input onChange={e => setFormData({...formData,'name': e.target.value})}
      placeholder="Note name"
      value={formData.name}
      style={{marginRight:'10px'}}
      />
<input onChange={e => setFormData({...formData,'description': e.target.value})}
      placeholder="Note description"
      value={formData.description}
      style={{marginRight:'10px'}}
      />
      <input onChange={e => setFormData({...formData,'comment': e.target.value})}
      placeholder="Note comments"
      value={formData.comment}
      style={{marginRight:'10px'}}
      />
      <input type="file" onChange={onChange} />
      
      
<button onClick={createNote}>
  Create Note
</button>

<div style={{marginBottom:30,alignSelf:'center'}}>
  {
    notes.map(note =>(
      <div key={note.id || note.name} style={{marginBottom:30,borderBottom:'1px dotted #cccccc',margin:'20px'}}>
      <h2>{note.name}</h2>
      <p>{note.description}</p>
      <p><i>{note.comment}</i></p>
      <p>
     {
     note.image && <img src={note.image} style={{width:400}} />
     }</p>
     <p>
          <button onClick={() => deleteNote(note)}>Delete note</button>
     </p>
  
      </div>
    ))
  }
</div>
   

   
    </div>
  );
}

export default withAuthenticator(App);
