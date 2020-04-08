import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  TableDataAvailabilityStatus,
  columnData,
  columnSelectors,
  conn,
  dbName,
} from "../helpers/constants";
import { query } from "stardog";
import Facebook from './Facebook';

const styles = {
    appInnerContainer: {
      width: "100%",
      margin: "0 auto"
    },
    paper: {
      overflowX: "auto"
    },
    spinner: {
      margin: "20px auto",
      display: "block"
    },
    actionCell: {
      textAlign: "center"
    }
  };


const readQuery = `SELECT ?id ?name ?gender ?birthday {
    ?person a foaf:Person;
    rdfs:label ?id;
    foaf:name ?name;
    foaf:gender ?gender;
    foaf:birthday ?birthday.        
  }`;



const columnHeaders = columnData.map(({ label }) => <TableCell key={label}>{label}</TableCell>);

export default class StardogTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataState: TableDataAvailabilityStatus.NOT_REQUESTED,
      data: [],
      dataItem:[],
      auth:false,
      userHasPages:[]
    };
    this.onChangedataItem = this.onChangedataItem.bind(this);
    
  } 

  onChangedataItem(newDataItem){
      console.log('hi from stardog');
      console.log(newDataItem);
      this.setState({
          dataItem:newDataItem,
          auth:newDataItem.auth,
      });
      this.addItem(this.state.dataItem);
      
  }

  

  addItem(dataItem) {
     
    

    const accounts = dataItem.accounts.map((value) => {

        return `:Page${value.id} a sioc:Forum;
                        rdfs:label "${value.name}".

        `;

    }).join('');

    

    const likes = dataItem.likes.map((value) => {

        
        if ( dataItem.likes.indexOf(value) === 0 ) {
            return `sioc:subscriber_of :Page${value.id}`;   
        }
        else {

            if (dataItem.likes.indexOf(value) === dataItem.likes.length - 1) {
                return `:Page${value.id}.`
            }
            else {
                return `:Page${value.id}`
            }
        
            
        }
        
    }).join();

    

    const hasPages = dataItem.accounts.map((value) => {

        
        if ( dataItem.accounts.indexOf(value) === 0 ) {
            return `sioc:moderator_of :Page${value.id}`;   
        }
        else {

             if (dataItem.accounts.indexOf(value) === dataItem.accounts.length - 1) {
                return `:Page${value.id}.`
            }
            else {
                return `:Page${value.id}`
            }
        }
        
    }).join();

  
    const updateTriples= `
        :User${dataItem.id} a sioc:User;
            sioc:email "${dataItem.email}";`
            +likes+` `+accounts+
            `
        :Person${dataItem.id} a foaf:Person;
            rdfs:label ${dataItem.id};
            foaf:name "${dataItem.name}";
            foaf:knows :Person10376576128723;	#Jane
            foaf:gender "${dataItem.gender}";
            foaf:birthday "${dataItem.birthday}";
            foaf:OnlineChatAccount "${dataItem.email}";
            foaf:holdsAccount :User${dataItem.id}.
        :User${dataItem.id} sioc:account_of :Person${dataItem.id};`
        +hasPages+`

            
        
        `;

    const updateQuery = `insert data { ${updateTriples} }`;

  
    // Add data to DB and clear the inputs when this succeeds.
    query.execute(conn, dbName, updateQuery).then((response) => {
      this.refreshData();
      console.log('hi');
      console.log(response);
    });
  }

  componentDidMount() {
    this.refreshData();
    this.refreshDataForGrids();
    console.log(this.state.userHasPages);
  }
  
  refreshData() {
    this.setState({
      dataState: TableDataAvailabilityStatus.LOADING
    });
    query.execute(conn, dbName, readQuery).then(res => {
        console.log(res);
      if (!res.ok) {
        this.setState({
          dataState: TableDataAvailabilityStatus.FAILED
        });
        return;
      }
  
      const { bindings } = res.body.results;
      const bindingsForTable = this.getBindingsFormattedForTable(bindings);
  
      this.setState({
        dataState: TableDataAvailabilityStatus.LOADED,
        data: bindingsForTable
      });
    });
  }

  refreshDataForGrids(){

    this.setState({
        dataState: TableDataAvailabilityStatus.LOADING
      });
      query.execute(conn, dbName, readQuery).then(res => {
          console.log(res);
        if (!res.ok) {
          this.setState({
            dataState: TableDataAvailabilityStatus.FAILED
          });
          return;
        }
    
        
        
    
        this.setState({
          dataState: TableDataAvailabilityStatus.LOADED,
          userHasPages:res.body.results.bindings,
        });
      });
      
  }
  
  getBindingsFormattedForTable(bindings) {

    const bindingsById = bindings.reduce((groupedBindings, binding) => {
      const { value: id } = binding.id;
      groupedBindings[id] = groupedBindings[id] ? groupedBindings[id].concat(binding) : [binding];
      return groupedBindings;
    }, {});
  
    return Object.keys(bindingsById)
      .map(id => parseInt(id, 10)) // convert ids from strings to numbers for sorting
      .sort() // we do this sorting client-side because `Object.keys` ordering is not guaranteed
      .map(id => {
        // For each `id`, merge the bindings together as described above.
        return bindingsById[id].reduce(
          (bindingForTable, binding) => {
            // Quick cleanup to remove IRI data that we don't want to display:
            const bindingValues = Object.keys(binding).reduce((valueBinding, key) => {
              const { type, value } = binding[key];
              valueBinding[key] = type !== "uri" ? value : value.slice(value.lastIndexOf("/") + 1); // data cleanup
              return valueBinding;
            }, {});
            // Aggregate movies on the `movies` property, deleting `movie`:
            const movies = bindingValues.movie
              ? bindingForTable.movies.concat(bindingValues.movie)
              : bindingForTable.movies;
            delete bindingValues.movie;
            return {
              ...bindingForTable,
              ...bindingValues,
              movies
            };
          },
          { movies: [] }
        );
      });
  }

  getBindingValueForSelector(selector, binding) {
    const bindingValue = binding[selector === "movie" ? "movies" : selector];
    // NOTE: In a production app, we would probably want to do this formatting elsewhere.
    return Array.isArray(bindingValue) ? bindingValue.join(", ") : bindingValue;
  }

  renderRowForBinding(binding, index) {
    return (
      // Use every "selector" to extract table cell data from each binding.
      <TableRow key={binding.id}>
      {columnSelectors.map(selector => (
        <TableCell key={selector}>
          {this.getBindingValueForSelector(selector, binding)}
        </TableCell>
      ))}
    </TableRow>
      
    );
  }
    render() {
        const { dataState, data } = this.state;
        const isLoading = dataState === TableDataAvailabilityStatus.LOADING;
        
      
        return (
        
        <div>
            <Facebook  changeDataItem={this.onChangedataItem}  />
          <div className="App" style={styles.appInnerContainer} >
            
            <CssBaseline />
            <Paper style={styles.paper}>
              <Toolbar>
                <Typography variant="title">
                  <i>Les utilisateurs de Facebook qui ont utilisé cette application </i> 
                </Typography>
              </Toolbar>
              {isLoading ? (
                <CircularProgress style={styles.spinner} />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      {columnHeaders}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((binding, index) => this.renderRowForBinding(binding, index)).concat(
                      // Create an additional row for adding a new entry (by
                      // iterating through our columnData and creating a table
                      // cell for each column).
                      <TableRow key={-1}>
                        {columnData.map(({ label, selector }) => (
                          <TableCell key={selector}>
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </div>
        </div>
       
        );
      }
  }


