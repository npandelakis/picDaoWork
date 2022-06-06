import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

import Dropdown from 'react-dropdown'

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
// import TokenArtifact from "../contracts/Token.json";
// import contractAddress from "../contracts/contract-address.json";

// import BoxArtifact from "../contracts/Box.json"
// import GovernerContractArtifact from "../contracts/governance_standard/GovernorContract.json"
// import GovernerContractAddress from "../contracts/governance_standard/GovernerContractAddress.json"

import GovernanceToken from "../contracts/GovernanceToken.json"
import GovernanceTokenAddress from "../contracts/GovernanceTokenAddress.json"

import Governer from "../contracts/governance_standard/Governer.json"

import Box from "../contracts/Box.json"

// import GovernerContractArtifact from "../contracts/governance_standard/GovernorContract.json"
// import TimeLockArtifact from "../contracts/governance_standard/TimeLock.json"


// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { DisplayBox } from "./DisplayBox";
// import { setMaxListeners } from "events";
// import { Transfer } from "./Transfer";
// import { TransactionErrorMessage } from "./TransactionErrorMessage";
// import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { BigNumber } from "ethers";

// This is the Hardhat Network id, you might change it in the hardhat.config.js.
// If you are using MetaMask, be sure to change the Network id to 1337.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class App extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      proposalId: undefined
    };

    this.state = this.initialState;
  }


  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
          boxValue={this.state.boxValue}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.tokenData || !this.state.balance) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              {this.state.tokenData.name} ({this.state.tokenData.symbol})
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.balance.toString()} {this.state.tokenData.symbol}
              </b>
              .
            </p>
            {/* <button onClick={() => this._transferTokens(this.state.selectedAddress, 100)}>Get {this.state.tokenData.symbol}</button> */}
          </div>
        </div>
        <div>
          <DisplayBox boxValue={this.state.boxValue}/>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {/* {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )} */}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {/* {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              /> */}
            {/* )} */}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {/*
              If the user has no tokens, we don't show the Transfer form
            */}
            {/* {this.state.balance.eq(0) && (
              <NoTokensMessage selectedAddress={this.state.selectedAddress} />
            )} */}
            {!(this.state.proposalId instanceof BigNumber) && (this.state.balance.gt(0)) && (
              <div>
                <form>
                  <label >URL Proposal</label>
                  <br></br>
                  <input type="text" id="url" name="url" onChange={(event) => this.setState({url:event})}/>
                </form>
                <button onClick={() => this._proposeURL()}>Propose</button>
              </div>
            )}
            {(this.state.proposalId instanceof BigNumber) && (this.state.balance.gt(0)) && (
              <div>
                <Dropdown options={this.voteOptions} value={this.defaultOption} onChange={(event) => this.setState({vote:event})}/>
                <button onClick={() => this._castVote()}>Vote</button>
              </div>
            )}
            {(this.state.proposalState === 5) && (
              <div>
                  <button onClick={() => this._executeProposal()}>Execute Proposal</button>
              </div>
            )}
            {/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
            {/* {this.state.balance.gt(0) && (
              <Transfer
                transferTokens={(to, amount) =>
                  this._transferTokens(to, amount)
                }
                tokenSymbol={this.state.tokenData.symbol}
              />
            )} */}
            {/* <DisplayBox boxValue={this._boxValue()} /> */}
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    const proposalId = window.localStorage.getItem('proposalId');
    if (window.localStorage.getItem('proposalId')) {
      this.setState({proposalId: BigNumber.from(JSON.parse(proposalId))})
      
      this.setState({encodedFunctionCall: window.localStorage.getItem('encodedFunctionCall')})
      this.setState({descriptionHash: window.localStorage.getItem('descriptionHash')})
    } else {
      this.setState({proposalId: undefined})
      this.setState({encodedFunctionCall: undefined})
      this.setState({descriptionHash: undefined})
    }
    // await this.setState({proposalId: BigNumber.from(JSON.parse(window.localStorage.getItem('proposalId')))})
    await this._initializeBox();
    var response = await this._box.retrieve();
    this.setState({boxValue: response});
    await this._initializeGoverner();
  }

  async _initializeBox() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._box = new ethers.Contract(
      Box.address,
      Box.abi,
      this._provider.getSigner(0)
    );
  }

  async _initializeGoverner() {
    this._governor = new ethers.Contract(
      Governer.address,
      Governer.abi,
      this._provider.getSigner(0)
    );
    this.setState({url : ""})
  this.voteOptions = [1, 0]
  this.defaultOption = this.voteOptions[2]
  }


  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _initializeEthers() {

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      GovernanceTokenAddress.Token,
      GovernanceToken.abi,
      this._provider.getSigner(0)
    );
  }

  

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);
    this._pollProposalState = setInterval(() => this._updateProposalState(), 1000);
    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
    this._updateProposalState();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    clearInterval(this._pollProposalState);
    this._pollDataInterval = undefined;
    this._pollProposalState = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }

  async _updateProposalState() {
    const curProposalState = await this._governor.state(this.state.proposalId);
    console.log(curProposalState)
    if (curProposalState === 4) {
      console.log(this.state.descriptionHash)
      console.log(this.encodeFunctionCall)
      await this._governor.queue([this._box.address], [0], [this.state.encodedFunctionCall], this.state.descriptionHash)
    } else if (curProposalState === 5) {
      await this._governor.exexute([this._box.address], [0], [this.state.encodedFunctionCall], this.state.descriptionHash)
    }

  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }

  async _proposeURL() {
    const description = "Change url"
    const encodedFunctionCall = this._box.interface.encodeFunctionData("store", [this.state.url])
    const descriptionHash = ethers.utils.id(description)
    const proposeTx = await this._governor.propose(
      [Box.address],
      [0],
      [encodedFunctionCall],
      description
    )

    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events[0].args.proposalId
    let proposalState = await this._governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)
    this.setState({proposalId: proposalId})

    window.localStorage.setItem('proposalId', JSON.stringify(proposalId))
    window.localStorage.setItem('encodedFunctionCall', encodedFunctionCall)
    window.localStorage.setItem('descriptionHash', descriptionHash)

    this.setState({proposalId: proposalId})
    this.setState({encodedFunctionCall: encodedFunctionCall})
    this.setState({descriptionHash: descriptionHash})
  }

  async _castVote() {
    console.log(this.state.proposalId)
    var tx = await this._governor.castVoteWithReason(this.state.proposalId, 1, "reason")
    tx.wait(1)
    console.log(tx)
  }
}
