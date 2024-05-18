import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Import Components
import Seat from './Seat'

// Import Assets
import close from '../assets/close.svg'

const SeatChart = ({ occasion, ticketBuyer, discountContract, provider, setToggle, account }) => {
  const [seatsTaken, setSeatsTaken] = useState(false)
  const [hasSold, setHasSold] = useState(false)

  const getSeatsTaken = async () => {
    const seatsTaken = await ticketBuyer.getSeatsTaken(occasion.id)
    setSeatsTaken(seatsTaken)
  }

  const buyHandler = async (_seat) => {
    setHasSold(false)

    const signer = await provider.getSigner()
    const tBalance = await discountContract.balanceOf(account);

    if(tBalance >= 3.0 && occasion.cost.gt(ethers.utils.parseEther('2.0'))){
      var occasionCostwDiscount = ethers.BigNumber.from(occasion.cost.sub(ethers.utils.parseEther('1.0')));
      if (occasionCostwDiscount.lt(ethers.BigNumber.from(0))){
        occasionCostwDiscount = ethers.BigNumber.from(0)
      }
      const transaction = await ticketBuyer.connect(signer).mintWithDiscount(occasion.id, _seat, { value: occasionCostwDiscount })
      await transaction.wait()
    }
    else {
      const transaction = await ticketBuyer.connect(signer).mint(occasion.id, _seat, { value: occasion.cost })
      await transaction.wait()
    }

    setHasSold(true)
  }

  useEffect(() => {
    getSeatsTaken()
  }, [hasSold])

  return (
    <div className="occasion">
      <div className="occasion__seating">
        <h1>{occasion.name} Seating Map 
        <div>{occasion.cost.gt(ethers.utils.parseEther('2.0')) && (
        <div>Discount 1 ETH for every 4th ticket*</div>
      )}</div> </h1>

        <button onClick={() => setToggle(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className="occasion__stage">
          <strong>STAGE</strong>
        </div>

        {seatsTaken && Array(Number(occasion.maxTickets)).fill(1).map((e, i) =>
          <Seat
            i={i}
            step={1}
            columnStart={0}
            maxColumns={27}
            rowStart={2}
            maxRows={7}
            seatsTaken={seatsTaken}
            buyHandler={buyHandler}
            key={i}
          />
        )}
      </div>
    </div >
  );
}

export default SeatChart;