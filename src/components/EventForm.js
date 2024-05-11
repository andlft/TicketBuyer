import { ethers } from 'ethers';
import { useState } from 'react'
import close from '../assets/close.svg'

const EventForm = ({ticketBuyer, provider, onClose }) => {

  const [formData, setFormData] = useState({
      name: '',
      cost: '',
      tickets: '',
      date: '',
      time: '',
      location: ''
      });

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const signer = await provider.getSigner()
    try {
      await ticketBuyer.connect(signer).list(
        formData.name,
        tokens(parseFloat(formData.cost)),
        parseInt(formData.tickets),
        formData.date,
        formData.time,
        formData.location,
      );
      onClose();
      const eventAddedHandler = (maxtickets) => {
        console.log(maxtickets.toString());
        window.location.reload();
      };
      ticketBuyer.on("RefreshPageAfterEvent", eventAddedHandler);
      return () => {
        ticketBuyer.off("RefreshPageAfterEvent", eventAddedHandler);
      };
    } catch (error) {
      console.error('Error listing event:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="occasion">
      <div className="occasion__seating">
      <button onClick={() => onClose(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>
        <form onSubmit={handleSubmit}>
        <label className='nav__brand'>
            Event Name:
            <input className='nav__search'  type="text" name="name" value={formData.name} onChange={handleInputChange} />
        </label>
        <label className='nav__brand'>
          Cost:
          <input className='nav__search' type="text" name="cost" value={formData.cost} onChange={handleInputChange} />
        </label>
        <label className='nav__brand'>
          Tickets:
          <input className='nav__search' type="text" name="tickets" value={formData.tickets} onChange={handleInputChange} />
        </label>
        <label className='nav__brand'>
          Date:
          <input className='nav__search' type="text" name="date" value={formData.date} onChange={handleInputChange} />
        </label>
        <label className='nav__brand'>
          Time:
          <input className='nav__search' type="text" name="time" value={formData.time} onChange={handleInputChange} />
        </label>
        <label className='nav__brand'>
          Location:
          <input className='nav__search' type="text" name="location" value={formData.location} onChange={handleInputChange} />
        </label >
        <button className='card__button' type="submit">Submit</button>
        </form>
      </div>
    </div >
  );
}

export default EventForm;