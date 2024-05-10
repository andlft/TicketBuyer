const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("HostManager", () => {

    let deployer, host1, host2;
    const FEE = 10;

    beforeEach(async () => {
        [deployer, host1, host2] = await ethers.getSigners()

        const HostManager = await ethers.getContractFactory("HostManager")
        hostManager = await HostManager.deploy()
    })

    describe("Deployment", () => {
        it("Check the owner", async () => {
            expect(await hostManager.owner()).to.be.equal(deployer.address)
        })
    })

    describe("Host Management", () => {
        it("Check owner is host", async () => {
            expect(await hostManager.checkHost(deployer.address)).to.be.equal(true)
        })

        it("Check pay fee", async () => {
            const transaction = await hostManager.connect(host1).payHostFee({value: FEE})
            await transaction.wait()

            expect(await hostManager.checkHost(host1.address)).to.be.equal(true)
        })
    })


})