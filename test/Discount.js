const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Discount Contract", () => {

    let deployer, host1, ticketBuyer;

    beforeEach(async () => {
        [deployer, host1] = await ethers.getSigners()

        const Discount = await ethers.getContractFactory("Discount")
        discountContract = await Discount.deploy("Discount", "DT", host1.address)

    })

    describe("Deployment", () => {
        it("Check the TB contract", async () => {
            expect(await discountContract.ticketBuyerContract()).to.be.equal(host1.address)
        })
    })

    describe("Discounts", () => {
        it("Check owner is host", async () => {
            expect(await discountContract.connect(host1).deposit(deployer.address)).to.not.be.reverted;
        })

        it("Check delete account tokens", async () => {
            await discountContract.connect(host1).deposit(deployer.address);
            expect(await discountContract.balanceOf(deployer.address)).to.not.be.equal(0);

            await discountContract.connect(host1).deleteTokenForAccount(deployer.address);
            expect(await discountContract.balanceOf(deployer.address)).to.be.equal(0);

        })
    })


})