This project attempts to combine two github projects into a "proof of concept"
project a decentralized autonomous organization (dao). Clone the repo onto 
your machine, then instantiate 3 separate terminals:

  Terminal 1: Project root directory

  Terminal 2: Project root directory
  
  Terminal 3: Frontend Folder

You can run the dao testing script from terminal 1 with the following command:
  
  "npx hardhat test"

To start a local blockchain for development, run
  
  "npx hardhat node"

in terminal 1.

Initiate the frontend of the project from terminal 3 with the command:
  
  "npm start"

Note that interacting with the DAO requires Metamask, so make sure to install
Metamask.

To issue yourself some governance tokens, run
  
  "npx hardhat --network localhost faucet 'address'"

from Terminal 2 where 'address' is the address of your wallet. This will 
transfer 5% of the total token supply and 1 ether to your wallet. To propose 
a change to the displayed photo, type in a url to the proposal box and click
'propose'. At this point, you will not be able to vote, since the timelock 
contract enforces a minimum number of block to be mined before voting. You can
mine empty blocks from terminal 2 by typing
  
  "npx hardhat --network localhost mine --amount X"

where X is the number of blocks to mine. The minimum blocks to be mined is
currently 1. To vote on the current proposal, select 1 to vote 'for' and
0 to vote 'against'.

KNOWN BUG: For whatever reason, hardhat does not seem to accept a vote for
the proposal as valid, so every vote will fail. It is not at all clear why
this happens, since the test cases pass without any problem.

If the vote passes, the proposal will be automatically queued and executed
by the governer (you).

NOTE: If you restart the chain in terminal 1, you will need to delete the 3
locally stored variables from the developer tools. These are stored locally
to avoid using a database to keep track of proposals for this simple project,
but it does get annoying to delete them all the time.

Sources:

https://github.com/PatrickAlphaC/dao-template

https://github.com/NomicFoundation/hardhat-hackathon-boilerplate