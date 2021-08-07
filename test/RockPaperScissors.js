const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let rps;
let addr1, addr2, addr3;
let overrides = {
  value: ethers.utils.parseEther("0.0001"),
};

beforeEach(async () => {
  [addr1, addr2, addr3] = await ethers.getSigners();

  const RockPaperScissors = await ethers.getContractFactory(
    "RockPaperScissors"
  );
  rps = await RockPaperScissors.deploy();
  await rps.deployed();

  await rps.createRoom(overrides);
});

describe("RockPaperScissors", function () {
  it("deploys a contract", async function () {
    assert.isOk(await rps.address);
  });

  it("player 1 creates a new room", async function () {
    assert.isOk(await rps.rooms);

    const roomData = await rps.getRoom(0);

    expect(roomData.player1).to.equal(addr1.address);
  });

  it("player 1 and player 2 creates seperate rooms", async function () {
    let roomData = await rps.getRoom(0);

    expect(roomData.id).to.equal(0);
    expect(roomData.player1).to.equal(addr1.address);

    await rps.connect(addr2).createRoom();

    roomData = await rps.connect(addr2).getRoom(1);

    expect(roomData.id).to.equal(1);
    expect(roomData.player1).to.equal(addr2.address);
  });

  it("player 2 joins room", async function () {
    await rps.connect(addr2).joinRoom(0, overrides);
    const roomData = await rps.getRoom(0);
    expect(roomData.player2).to.equal(addr2.address);
  });

  it("player 1 can make a move", async function () {
    await rps.makeMove(0, 1);
    const roomData = await rps.getRoom(0);
    expect(roomData.move1).to.equal(1);
  });

  it("player 2 can make a move", async function () {
    await rps.connect(addr2).joinRoom(0, overrides);
    await rps.connect(addr2).makeMove(0, 3);
    const roomData = await rps.getRoom(0);
    expect(roomData.move2).to.equal(3);
  });

  it("both players make a move and player 1 wins", async function () {
    let roomData = await rps.getRoom(0);
    expect(roomData.winner).to.equal(0);

    await rps.makeMove(0, 1);
    await rps.connect(addr2).joinRoom(roomData.id, overrides);
    await rps.connect(addr2).makeMove(roomData.id, 3);

    roomData = await rps.getRoom(roomData.id);
    expect(roomData.winner).to.equal(1);

    expect(await rps.getEarnings()).to.equal(100000000000000);
    expect(await rps.connect(addr2).getEarnings()).to.equal(-100000000000000);
  });

  it("both players make a move and player 2 wins", async function () {
    let roomData = await rps.getRoom(0);
    expect(roomData.winner).to.equal(0);

    await rps.makeMove(roomData.id, 1);
    await rps.connect(addr2).joinRoom(roomData.id, overrides);
    await rps.connect(addr2).makeMove(roomData.id, 2);

    roomData = await rps.getRoom(roomData.id);
    expect(roomData.winner).to.equal(2);
  });

  it("both players make a move and its a draw", async function () {
    let roomData = await rps.getRoom(0);
    expect(roomData.winner).to.equal(0);

    await rps.makeMove(roomData.id, 1);
    await rps.connect(addr2).joinRoom(roomData.id, overrides);
    await rps.connect(addr2).makeMove(roomData.id, 1);

    roomData = await rps.getRoom(roomData.id);
    expect(roomData.winner).to.equal(0);
  });

  it("player 3 cant join full room", async function () {
    await rps.connect(addr2).joinRoom(0, overrides);

    let err = null;

    try {
      await rps.connect(addr3).joinRoom(0, overrides);
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
  });

  it("player 3 cant make a move on another room", async function () {
    await rps.connect(addr2).joinRoom(0, overrides);

    let err = null;

    try {
      await rps.connect(addr3).makeMove(0, 1);
    } catch (error) {
      err = error;
    }

    assert.ok(err instanceof Error);
  });
});
