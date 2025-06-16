const { expect } = require('chai');
const { ethers } = require("hardhat");

describe("EscrowContract", function() {
    let EscrowContract, escrow;
    let client, freelancer, other;
    let amount;

    this.beforeEach(async function() {
        [client, freelancer, other] = await ethers.getSigners();
        amount = ethers.parseEther("1.0");

        EscrowContract = await ethers.getContractFactory("EscrowContract");
        escrow = await EscrowContract.deploy();
        await escrow.waitForDeployment();
    });

    it("Initialization test", async function (){
        await escrow.connect(client).createContract(freelancer.address, { value: amount });

        const contract = await escrow.contracts(0);
        expect(contract.amount).to.equal(amount);
        expect(contract.client).to.equal(client.address);

        expect(await escrow.count()).to.equal(1);
    });


    it("MarkAsCompleted", async function () {
        await escrow.connect(client).createContract(freelancer.address, { value: amount });   
        expect(await escrow.count()).to.equal(1);
        
        let contract = await escrow.contracts(0);
        expect(contract.completed).to.be.false;
        await escrow.connect(freelancer).markAsCompleted(0);
        contract = await escrow.contracts(0);
        expect(contract.completed).to.be.true;

        await expect(escrow.connect(other).markAsCompleted(0)).to.be.revertedWith("Not a freelancer");
    });

    it("Approve", async function () {
        await escrow.connect(client).createContract(freelancer.address, { value: amount }); 
        expect(await escrow.count()).to.equal(1);  
        
        let contract = await escrow.contracts(0);
        
        await escrow.connect(freelancer).markAsCompleted(0);
        contract = await escrow.contracts(0);
        expect(contract.completed).to.be.true;

        await escrow.connect(client).approveWork(0);
        contract = await escrow.contracts(0);
        expect(contract.approved).to.be.true;
        await expect(escrow.connect(other).approveWork(0)).to.be.revertedWith("Not a client");
    });

    it("Not existed", async function () {
        await escrow.connect(client).createContract(freelancer.address, { value: amount }); 
        expect(await escrow.count()).to.equal(1);  
        
        await expect(escrow.connect(freelancer).markAsCompleted(1)).to.be.revertedWith("Contract with that _id not existed");
    });

    it("Withdraw", async function () {
        await escrow.connect(client).createContract(freelancer.address, { value: amount }); 
        expect(await escrow.count()).to.equal(1);  
        
        let contract = await escrow.contracts(0);
        
        await escrow.connect(freelancer).markAsCompleted(0);
        contract = await escrow.contracts(0);
        expect(contract.completed).to.be.true;

        await escrow.connect(client).approveWork(0);
        contract = await escrow.contracts(0);
        expect(contract.approved).to.be.true;

        const beforeBalance = await ethers.provider.getBalance(freelancer.address);
        const tx = await escrow.connect(freelancer).withdraw(0);
        const receipt = await tx.wait();
        const difference = tx.gasPrice * receipt.gasUsed;
        const afterBalance = await ethers.provider.getBalance(freelancer.address);
        console.log(typeof(beforeBalance));

        expect(beforeBalance + amount).to.equal(afterBalance + difference);  
    });
})