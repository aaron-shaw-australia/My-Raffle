import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import raffle from './lottery';
import Layout from './Layout';
import { Card, Button, Input } from 'semantic-ui-react';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    loadingPickWinner:false,
    loading:false,
    winner:'No Winner Chosen Yet'
  };

  async componentDidMount() {
    const manager = await raffle.methods.manager().call();
    const players = await raffle.methods.getTickets().call();
    const balance = await web3.eth.getBalance(raffle.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    if(accounts && accounts[0]){

    this.setState({ message: 'Waiting on transaction success...', loading:true });

    await raffle.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('.1', 'ether')
    });

    this.setState({ message: 'You have entered!  Please refresh the page to reload the information.', loading:false });
  }else{
    this.setState({ message: 'You must be logged into Metamask on the Rinkby network to use this application.', loading:false });
  }
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Please wait on transaction to confirm ...', loadingPickWinner:true });

    const winner = await raffle.methods.pickWinner().send({
      from: accounts[0]
    });
    console.log(winner);
    this.setState({ message: 'A winner has been chosen ! The Raffle funds have been sent successfully to the winning address.' , loadingPickWinner:false});
  };

  renderRows() {
      return this.state.players.map((request, index) => {
        const something = index + " : " + request;
        return (
        <p>{something}</p>

        );
      });
    }

  render() {
    let ticketAddresses = this.renderRows();
    return (
      <Layout>

      <div>

        <p><b>A test application only and is running on the Rinkby test network (test Ether).  Definately not to be used in a live environment with real Ether.</b></p>
        <p>
        There are currently{' '}
          {this.state.players.length} ticket/s purchased for this Raffle and the prize pool is {' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <h3>List of tickets & address of holders.</h3>
        {ticketAddresses}

        <form onSubmit={this.onSubmit}>
          <h2>Want to try your luck?</h2>
          <div>
            <p>Please click the 'Enter' button to purchase a raffle ticket for .1 Ether.</p>
            <p> You will need to use MetaMask and switch to the Rinkby test network.  You can get Rinkby Ether here : <a href="https://faucet.rinkeby.io/" target="_BLANK">https://faucet.rinkeby.io</a> </p>
            <p> You can purchase as many tickets as you wish to increase your chance of winning. </p>
            <br />
            <Input
            disabled
              placeholder='.1 Ether'
              value='.1'

            />
          </div>
          <br />
          <Button
                  loading={this.state.loading}
                  floated="left"
                  content="Enter"
                  icon="rocket"
                  primary
                />
                <br /><br />
                  {this.state.message}
        </form>
<br />
        <h5>Run the Raffle</h5>
        <Button
                onClick={this.onClick}
                loading={this.state.loadingPickWinner}
                floated="left"
                content="A Winner Will Be Randomly Selected!"
                icon="sun"
                primary
              />
      </div>
      </Layout>
    );
  }
}

export default App;
