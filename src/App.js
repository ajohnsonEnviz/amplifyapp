import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {API, Storage} from 'aws-amplify';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react'
import {listTodos} from './graphql/queries';
import {createTodo as createNoteMutation, deleteTodo as deleteNoteMutation} from './graphql/mutations';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {CardActions } from '@mui/material';

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
       <AppBar position="static" style={{ background: 'linear-gradient(to right, #314755 0%, #26a0da  51%, #314755  100%)'}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Notes App
          </Typography>
          <AmplifySignOut  />
        </Toolbar>
      </AppBar>


    
<div style={{backgroundColor:'#ffffff',padding:'20px',margin:'20px',border:'1px dotted #314755'}}>
<TextField id="filled-basic" style={{marginRight:'20px'}}  label="Name" variant="outlined"  value={formData.name} onChange={e => setFormData({...formData,'name': e.target.value})} />


<TextField id="filled-basic" style={{marginRight:'20px'}}  label="Description" variant="outlined"  value={formData.description} onChange={e => setFormData({...formData,'description': e.target.value})}/>


<TextField id="filled-basic" style={{marginRight:'20px'}} label="Comments" variant="outlined"  value={formData.comment} onChange={e => setFormData({...formData,'comment': e.target.value})}/>


      <input type="file" onChange={onChange} />
      


<Button variant="contained" onClick={createNote} style={{marginTop:'10px'}}>Create Note</Button>
</div>
<div style={{marginBottom:30}}>
  <h1>Family Members</h1>

  <Grid container spacing={3} style={{alignSelf:'center',padding:'10px',margin:'10px',}}>

 
  {
    notes.map(note =>(

<Grid item  >
<Card sx={{ display: 'flex' }} variant="outlined" style={{backgroundColor:'#517fa4',color:'#ffffff'}}>
<Box sx={{ display: 'flex', flexDirection: 'column' }}>
  <CardContent style={{ color:'#ffffff'}}>
    <Typography component="div" variant="h5" style={{color:'#ffffff'}}>
   <b> {note.name}</b>
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" component="div" style={{color:'#ffffff'}}>
   <p> {note.description}</p>
   <p> <i style={{fontSize:'14px'}}>{note.comment !== null ? note.comment : "No comments provided."}</i></p>
    </Typography>
  </CardContent>
  <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>

  <IconButton color="primary" aria-label="upload picture" component="span"  onClick={() => deleteNote(note)} style={{marginTop:'10px'}} >
          <DeleteIcon color="error"  />
        </IconButton>
  </Box>
</Box>
<CardMedia
  component="img"
  sx={{ width: 151 }}
  image={note.image}
  alt="Live from space album cover"
/>
</Card>
</Grid>
    ))
  }
 </Grid>
   

   
    </div>
    </div>
  );
}

export default withAuthenticator(App);
