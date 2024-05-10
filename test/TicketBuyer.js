const { expect } = require("chai")
const { ethers } = require("hardhat")

const NAME = "TicketBuyer"
const SYMBOL = "TB"

const OCCASION_NAME = "test_occasion"
const OCCASION_COST = ethers.utils.parseUnits("1", "ether")
const OCCASION_MAX_TICKETS = 100
const OCCASION_DATE = "Jan 12"
const OCCASION_TIME = "20:00"
const OCCASION_LOCATION = "Bucharest"

describe("TicketBuyer", () => {

  let deployer, buyer

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners()

    const TicketBuyer = await ethers.getContractFactory("TicketBuyer")
    ticketBuyer = await TicketBuyer.deploy(NAME, SYMBOL)
    const HostManager = await ethers.getContractFactory("HostManager")
    hostManager = await HostManager.deploy()

    await ticketBuyer.connect(deployer).changeHostContract(hostManager.address);

    const transaction = await ticketBuyer.connect(deployer).list(
      OCCASION_NAME,
      OCCASION_COST,
      OCCASION_MAX_TICKETS,
      OCCASION_DATE,
      OCCASION_TIME,
      OCCASION_LOCATION
    )

    await transaction.wait()
  })

  describe("Deployment", () => {
    it("Sets the name", async () => {
      expect(await ticketBuyer.name()).to.equal(NAME)
    })

    it("Sets the symbol", async () => {
      expect(await ticketBuyer.symbol()).to.equal(SYMBOL)
    })

    it("Sets the owner", async () => {
      expect(await ticketBuyer.owner()).to.equal(deployer.address)
    })
  })

  describe("Occasions", () => {
    it("Updates occasions count", async () => {
      const totalOccasions = await ticketBuyer.totalOccasions()
      expect(totalOccasions).to.be.equal(1)
    })

    it("Returns occasions attributes", async () => {
      const occasion = await ticketBuyer.getOccasion(1)
      expect(occasion.id).to.be.equal(1)
      expect(occasion.name).to.be.equal(OCCASION_NAME)
      expect(occasion.cost).to.be.equal(OCCASION_COST)
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS)
      expect(occasion.date).to.be.equal(OCCASION_DATE)
      expect(occasion.time).to.be.equal(OCCASION_TIME)
      expect(occasion.location).to.be.equal(OCCASION_LOCATION)
    })
  })

  describe("Minting", () => {
    const ID = 1
    const SEAT = 10
    const AMOUNT = ethers.utils.parseUnits("1", "ether")


    beforeEach(async () => {
      const transaction = await ticketBuyer.connect(buyer).mint(ID, SEAT, { value: AMOUNT})
      await transaction.wait()
    })
    
    it("Updates ticket count", async () => {
      const occasion = await ticketBuyer.getOccasion(1)
      expect(occasion.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1)
    })

    it("Updates buying status", async () => {
      const status = await ticketBuyer.hasBought(ID, buyer.address)
      expect(status).to.be.equal(true)
    })

    it("Updates seat status", async () => {
      const owner = await ticketBuyer.seatTaken(ID, SEAT)
      expect(owner).to.be.equal(buyer.address)
    })

    it("Updates overall seating status", async() => {
      const seats = await ticketBuyer.getSeatsTaken(ID)
      expect(seats.length).to.be.equal(1)
      expect(seats[0]).to.equal(SEAT)
    })

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(ticketBuyer.address)
      expect(balance).to.be.equal(AMOUNT)
    })

    describe("Withdrawing", () => {
      const ID = 1
      const SEAT = 50
      const AMOUNT = ethers.utils.parseUnits("1", 'ether')
      let balanceBefore
  
      beforeEach(async () => {
        balanceBefore = await ethers.provider.getBalance(deployer.address)
  
        let transaction = await ticketBuyer.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
        await transaction.wait()
  
        transaction = await ticketBuyer.connect(deployer).withdraw()
        await transaction.wait()
      })
  
      it('Updates the owner balance', async () => {
        const balanceAfter = await ethers.provider.getBalance(deployer.address)
        expect(balanceAfter).to.be.greaterThan(balanceBefore)
      })
  
      it('Updates the contract balance', async () => {
        const balance = await ethers.provider.getBalance(ticketBuyer.address)
        expect(balance).to.equal(0)
      })
    })
  })
})
