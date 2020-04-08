import FacebookLoginBtn from 'react-facebook-login';
import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import {
    TableDataAvailabilityStatus,
    conn,
    dbName,
  } from "../helpers/constants";
import { query } from "stardog";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';



function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }


const readQuery_1 = `SELECT ?countUsers (COUNT( DISTINCT ?user) as ?countUsers) WHERE{
    ?page a sioc:Forum.
    ?user a sioc:User;
        sioc:moderator_of ?page.
}`;

const readQuery_2 = `SELECT ?persons (COUNT( DISTINCT ?person) as ?persons) WHERE{
    ?person a foaf:Person.
}`;


export default class Facebook extends Component {

    constructor(){
        super();
        this.onChangeDataItem = this.onChangeDataItem.bind(this);
        this.state = {
            dataState: TableDataAvailabilityStatus.NOT_REQUESTED,
            open:false,
            usersLikedYourPage:["0"],
            usersHasPages:["0"],
            usersInDataBase:["0"],
            pagesLikedByConnectedUser:["0"],
            connectedUserHasPages:["O"],
            auth: false,
            data: {
                id:'',
                email:'',
                gender:'',
                birthday:'',
                name: '',
                accounts:[],
                friends:[],
                likes:[], 
                picture:""
            }  
        
        };
    
    }  


constructQuery_3(){

    const readQuery_3 = `  SELECT ?countPages (COUNT( DISTINCT ?page) as ?countPages) WHERE{
        ?page a sioc:Forum.
        :User${this.state.data.id} sioc:subscriber_of ?page.
    }`;

    console.log(readQuery_3);

    return readQuery_3;



}


constructQuery_4(){

    const readQuery_4= ` SELECT ?countPages (COUNT( DISTINCT ?page) as ?countPages) WHERE{
            ?page a sioc:Forum.
            :User${this.state.data.id} sioc:moderator_of ?page.
        }`;
    
    return readQuery_4;
    
    
    
    }  

constructQuery_5(){

    if ( this.state.data.accounts.length !== 0 ) {
        const userPageId = this.state.data.accounts[0].id;
        const readQuery_5 = ` SELECT ?countUsers (COUNT( DISTINCT ?user) as ?countUsers) WHERE{
            ?user a sioc:User;
                sioc:subscriber_of :Page${userPageId}.  
        }
        `;
            
        return readQuery_5;

    }

       
        
        
    }  




executeQuery_1 (readQuery_1) {

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
    query.execute(conn, dbName, readQuery_1).then(res => {
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED,
          });
        }
        else {
            this.setState({
                usersHasPages:res.body.results.bindings.map((value)=>
                {
                    console.log('users has pages avant')
                    console.log(this.state.usersHasPages);
                    return value.countUsers.value;

                })
            })
            console.log(this.state.usersHasPages);
           
        }
      });

}

executeQuery_2 (readQuery_2) {

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
    query.execute(conn, dbName, readQuery_2).then(res => {
        
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED,
          });
        }
        else {
            this.setState({
                usersInDataBase:res.body.results.bindings.map((value)=>
                {   
                    console.log('nombre de personnes dans la base de données');
                    console.log(this.state.usersInDataBase);
                    return value.persons.value;

                })
            })
            console.log(this.state.usersInDataBase);
           
        }
      });

}

executeQuery_3 (readQuery_3) {

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
    query.execute(conn, dbName, readQuery_3).then(res => {
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED,
          });
        }
        else {
            this.setState({
                usersInDataBase:res.body.results.bindings.map((value)=>
                {
                    return value.countPages.value;

                })
            })
          
        }
      });

}

executeQuery_4 (readQuery_4) {

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
    query.execute(conn, dbName, readQuery_4).then(res => {
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED,
          });
        }
        else {
            this.setState({
                connectedUserHasPages:res.body.results.bindings.map((value)=>
                {
                    return value.countPages.value;

                })
            })
          
        }
      });

}

executeQuery_5 (readQuery_5) {

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
    query.execute(conn, dbName, readQuery_5).then(res => {
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED,
          });
        }
        else {
            this.setState({
                connectedUserHasPages:res.body.results.bindings.map((value)=>
                {
                    return value.countUsers.value;

                })
            })
          
        }
      });

}
    
responseFacebook = response => {
    console.log(response);
    if(response.status !== 'unknown')
    this.setState({
        auth: true,
        data: {
            name: response.name,
            id:response.id,
            email:response.email,
            gender:response.gender,
            birthday:response.birthday,
            accounts:response.accounts.data,
            friends:response.friends.data,
            likes:response.likes.data,
            picture:response.picture
        }     
    });
    
    this.onChangeDataItem();
    this.executeQuery_1(readQuery_1);
    this.executeQuery_2(readQuery_2);
    this.executeQuery_3(this.constructQuery_3());
    this.executeQuery_4(this.constructQuery_4());
    this.executeQuery_5(this.constructQuery_5());
    this.setState({
        open:true,
    })

   
    
    

}

handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState(
        {
            open:false,
        });
  };




onChangeDataItem() {
    this.props.changeDataItem(this.state.data);

}

componentClicked = () => {
    console.log('Facebook btn clicked');
}

render () {

    const { usersHasPagesState, usersHasPages } = this.state;
    const { usersInDataBaseState, usersInDataBase } = this.state;
    const { pagesLikedByConnectedUserState, pagesLikedByConnectedUser } = this.state;
    const { usersLikedYourPageState, usersLikedYourPage } = this.state;
    const { connectedUserHasPagesState, connectedUserHasPages } = this.state;
    const isLoading = ( usersHasPagesState 
                        && usersInDataBaseState 
                        && pagesLikedByConnectedUserState
                        && connectedUserHasPagesState
                        && usersLikedYourPageState )  
                                        === TableDataAvailabilityStatus.LOADING;
    const table = [
        { "id":0,
        "value":usersHasPages,
        "label":"Nombres des modérateurs de pages"

        },
        { "id":1,
        "value":usersInDataBase,
        "label":"Nombre des utilisateurs qui sont inscris ici"

        },
        { "id":2,
        "value":pagesLikedByConnectedUser,
        "label":"Nombre des pages aimé par vous"

        },
        { "id":3,
        "value":connectedUserHasPages,
        "label":"Nombre de pages que vous possedez"

        },
        { "id":4,
        "value":usersLikedYourPage,
        "label":"Nombre de j'aime pour votre page"

        }
    ];

    const styles = {
        root: {
          flexGrow: 1,
        },
        paper: {
          height: 140,
          width: 100,
        },
        label : {
            padding:10,
        },
        icon:{
            height:60,
            width:'auto',
        },
        alert: {
            width: '100%',
            '& > * + *': {
              marginTop: 3,
            },
          },
        
      };
    
    const useStyles = makeStyles((theme) => ({
        root: {
          width: '100%',
          '& > * + *': {
            marginTop: theme.spacing(2),
          },
        },
      }));

    let facebookData;
    
    if ( this.state.auth) {

        facebookData = (
            <div>
                <AccountCircleIcon className="icon" style={styles.icon}></AccountCircleIcon> 
                <h2>Bienvenue  {this.state.data.name} !</h2>
                <p>
            <Grid container className="root" style={styles.root} spacing={2} >
            <Grid item xs={12}>
            <Grid container justify="center" spacing={7}>
              {table.map((value) => (
                <Grid key={value.id} item>
                
                  <Paper className="paper" style={styles.paper} >
                      <h5>
                         
                         <p style={styles.label}>
                            {value.label} 
                         </p>
                          {value.value}
                         
                      </h5>
                  </Paper>
              
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        </p>
        <div style={useStyles.alert}>
        <Snackbar open={this.state.open} autoHideDuration={1000} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity="success">
          You are Logged in successfully
        </Alert>
      </Snackbar>
        </div>
               
            </div>
            
        );

    }
    else {

        facebookData = (
            <FacebookLoginBtn
                appId="514795649183960"
                autoload={true}
                fields="name,email,picture,birthday,gender,accounts{id,name,category},friends{id},likes{id,name,category}"
                onClick={this.componentClicked}
                callback={this.responseFacebook }
                />
         
        );

    }
    
    return (
        
        <>
        <div>
           
        </div>
        <div>
            {facebookData}
            <p>
            
            </p>
        </div>
       
        </>
       
        
      
    );

}

}

