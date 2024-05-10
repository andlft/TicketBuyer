const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners()
  const NAME = "TicketBuyer"
  const SYMBOL = "TB"

  // Deploy TicketBuyer contract
  const TicketBuyer = await ethers.getContractFactory("TicketBuyer")
  const ticketBuyer = await TicketBuyer.deploy(NAME, SYMBOL)
  await ticketBuyer.deployed()

  // Deploy HostManager contract
  const HostManager = await ethers.getContractFactory("HostManager")
  const hostManager = await HostManager.deploy()
  await hostManager.deployed()

  // Set HostManager contract in TicketBuyer
  await ticketBuyer.connect(deployer).changeHostContract(hostManager.address);

  console.log(`Deployed TicketBuyer Contract at: ${ticketBuyer.address}\n`)
  console.log(`Deployed HostManager Contract at: ${hostManager.address}\n`)
  console.log(`Deployer: ${deployer.address}\n`)

  // List mock events
  const occasions = [
    {
      name: "Event 1",
      cost: tokens(2),
      tickets: 0,
      date: "Jun 20",
      time: "16:00",
      location: "London"
    },
    {
      name: "Event 2",
      cost: tokens(3),
      tickets: 125,
      date: "Jun 24",
      time: "18:00",
      location: "Zurich"
    },
    {
      name: "Event 3",
      cost: tokens(0.5),
      tickets: 0,
      date: "Jun 26",
      time: "10:00",
      location: "Bucharest"
    },
    {
      name: "Event 4",
      cost: tokens(5),
      tickets: 55,
      date: "Jun 11",
      time: "14:30",
      location: "Berlin"
    }
  ]

  for (var i = 0; i < 4; i++) {
    const transaction = await ticketBuyer.connect(deployer).list(
      occasions[i].name,
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    )

    await transaction.wait()

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});