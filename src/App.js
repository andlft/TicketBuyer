import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Card from './components/Card'
import EventForm from './components/EventForm'
import SeatChart from './components/SeatChart'

// ABIs
import TicketBuyer from './abis/TicketBuyer.json'
import HostManager from './abis/HostManager.json'
import DiscountABI from './abis/Discount.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [ticketbuyer, setTicketBuyer] = useState(null)
  const [hostmanager, setHostManager] = useState(null)
  const [discountcontract, setDiscoutContract] = useState(null)
  const [occasions, setOccasions] = useState([])
  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const ticketBuyerAddress = config[network.chainId].TicketBuyer.address
    const ticketBuyer = new ethers.Contract(ticketBuyerAddress, TicketBuyer, provider);
    setTicketBuyer(ticketBuyer)

    const hostManagerAddress = config[network.chainId].HostManager.address
    const hostManager = new ethers.Contract(hostManagerAddress, HostManager, provider);
    setHostManager(hostManager)

    const DiscountAddress = config[network.chainId].Discount.address
    const discountContract = new ethers.Contract(DiscountAddress, DiscountABI, provider);
    setDiscoutContract(discountContract)

    const totalOccasions = await ticketBuyer.totalOccasions()
    
    const occasions = []

    for (var i = 1; i <= totalOccasions; i++){
      const occasion = await ticketBuyer.getOccasion(i)
      occasions.push(occasion)
    }

    setOccasions(occasions)

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    const verifyHost = await hostManager.checkHost(account)
    if (verifyHost){
      setIsHost(true)
    }

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
      
      const verifyHost = await hostManager.checkHost(account)
      if (verifyHost){
        setIsHost(true)
      }
      else (
        setIsHost(false)
      )
    })

    const ticketBoughtHandler = (buyer, occasionId, seat) => {
      console.log(buyer,occasionId.toString(),seat.toString());
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

  const handlePayHostFee = async () => {
    const signer = await provider.getSigner()
    try {
      const transaction = await hostmanager.connect(signer).payHostFee({ value: hostmanager.HOST_FEE() })
      await transaction.wait()  
    } catch (error) {
      console.error('Error paying fee', error)
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
      {(account != null && isHost)  && (
              <div>
                <button className='nav__connect' style={{ marginLeft: '10%' }} onClick={handleAddEventClick}>Add Event</button>
                <button className='nav__connect' onClick={handleWithdrawMoney}>Withdraw Funds</button>
              </div>
            )}
      {(account != null && !isHost)  && (
        <div>
          <button className='nav__connect' style={{ marginLeft: '10%' }} onClick={handlePayHostFee}>Become an event host</button>
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
          discountContract={discountcontract}
          provider={provider}
          setToggle={setToggle}
          account = {account}
        />
      )}

    </div>
  );
}

export default App;