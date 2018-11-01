/** @jsx preact.h */
const apiConsumer = new ApiConsumer(7002);

const appStyle = {
  margin: '2rem auto'
};

function ListItem ({ item }) {
  return <li className="list-group-item" key={item.id}>{item.name}</li>
}

function List({ items }) {
  if (items.length === 0) {
    return <p>No companies in DB.</p>
  }
  return (
    <ul className="list-group">
      {items.map(item => <ListItem item={item} />)}
    </ul>
  )
}

class App extends preact.Component {
  constructor () {
    super();
    this.state = {
      items: []
    }
  }

  listCompanies = () => {
    apiConsumer.get().then(data => this.setState({ items: data }));
  }

  render () {
    return (
      <div className="container" style={appStyle}>
        <div className="row">
          <div className="col-4">
            <List items={this.state.items} />
            <button className="btn btn-primary">List Companies</button>
          </div>
          <div className="col-8" />
        </div>
      </div>
    );
  }
}

preact.render(<App />, document.body);