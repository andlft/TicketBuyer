import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Card from './components/Card'
import EventForm from './components/EventForm'
import SeatChart from './components/SeatChart'

// ABIs
import TicketBuyer from './abis/TicketBuyer.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [ticketbuyer, setTicketBuyer] = useState(null)
  const [occasions, setOccasions] = useState([])
  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)
  const [deployer, setDeployer] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const address = config[network.chainId].TicketBuyer.address
    const ticketBuyer = new ethers.Contract(address, TicketBuyer, provider);
    setTicketBuyer(ticketBuyer)

    const deployer = await ticketBuyer.owner()
    console.log("Deployer address:", deployer);
    setDeployer(deployer)

    const totalOccasions = await ticketBuyer.totalOccasions()
    
    const occasions = []

    for (var i = 1; i <= totalOccasions; i++){
      const occasion = await ticketBuyer.getOccasion(i)
      occasions.push(occasion)
    }

    setOccasions(occasions)

    console.log(occasions)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })

    const ticketBoughtHandler = (buyer, occasionId, seat) => {
      console.log(buyer,occasionId,seat);
      window.location.reload();
    }

    ticketBuyer.on("TicketBought", ticketBoughtHandler);

  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const handleAddEventClick = () => {
    setIsFormOpen(true);
  };

  const handleWithdrawMoney = async () => {
    const signer = await provider.getSigner()
    try {
      await ticketbuyer.connect(signer).withdraw();
    } catch (error) {
      console.error('Error listing event:', error);
    }
  }

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount}/>
        <h2 className='header__title'>
          <strong>Events</strong> 
        </h2>
      </header>

      <div style={{backgroundColor: "black", padding: "5px"}}>
      {(deployer === account && deployer !=  null)  && (
              <div>
                <button className='nav__connect' style={{ marginLeft: '10%' }} onClick={handleAddEventClick}>Add Event</button>
                <button className='nav__connect' onClick={handleWithdrawMoney}>Withdraw Funds</button>
              </div>
            )}
      </div>

      <div className='cards'>
        {occasions.map((occasion, index) => (
            <Card
              occasion={occasion}
              id={index+1}
              ticketBuyer={ticketbuyer}
              provider={provider}
              account={account}
              toggle={toggle}
              setToggle={setToggle}
              setOccasion={setOccasion}
              key={index}
            />
        ))}

      </div>

      {isFormOpen && (
        <EventForm
          ticketBuyer={ticketbuyer}
          provider={provider}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {toggle && (
        <SeatChart
          occasion={occasion}
          ticketBuyer={ticketbuyer}
          provider={provider}
          setToggle={setToggle}
        />
      )}

    </div>
  );
}

export default App;