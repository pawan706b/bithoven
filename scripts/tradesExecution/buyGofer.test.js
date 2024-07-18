const fs = require('fs-extra');
const path = require('path');
const ethers = require('ethers');
const BigNumber = require('bignumber.js');
const BuyGofer = require('./buyGofer');
const { expect } = require('chai');
const sinon = require('sinon');

// Mock dependencies
const mockProvider = new ethers.providers.JsonRpcProvider();
const mockLogger = { logInfo: sinon.stub(), logWarning: sinon.stub(), logError: sinon.stub() };
const mockTxGofer = { selectNextFreeKeySlot: sinon.stub(), recordPendingOrder: sinon.stub() };
const mockKeyFleet = { getERC20Balance: sinon.stub() };
const mockBuyBits = sinon.stub();
const mockGetBuyPrice = sinon.stub();

// Mock configuration
const mockConfig = {
  providerURL: 'http://localhost:8545',
  simulation: true,
  contractAddress: '0xContractAddress',
  buyGasLimit: 100000,
  staleBuyOrderMinutes: 10,
  warningLogIntervalMinutes: 5,
  preSelectSlotSleepMilliseconds: 1000
};

// Mock file system
const mockFs = {
  ensureDir: sinon.stub(),
  readdir: sinon.stub(),
  pathExists: sinon.stub(),
  remove: sinon.stub(),
  readJson: sinon.stub()
};

// Replace actual dependencies with mocks
sinon.replace(fs, 'ensureDir', mockFs.ensureDir);
sinon.replace(fs, 'readdir', mockFs.readdir);
sinon.replace(fs, 'pathExists', mockFs.pathExists);
sinon.replace(fs, 'remove', mockFs.remove);
sinon.replace(fs, 'readJson', mockFs.readJson);
sinon.replace(ethers.providers, 'JsonRpcProvider', sinon.stub().returns(mockProvider));
sinon.replace(BigNumber, 'BigNumber', sinon.stub().returns({ multipliedBy: sinon.stub(), isLessThan: sinon.stub(), toString: sinon.stub() }));
sinon.replace(require('../../common/logger'), 'Logger', sinon.stub().returns(mockLogger));
sinon.replace(require('../../fleet/txGofer'), 'TxGofer', sinon.stub().returns(mockTxGofer));
sinon.replace(require('../../fleet/keyFleet'), 'KeyFleet', sinon.stub().returns(mockKeyFleet));
sinon.replace(require('../../common/contractUtil/buy'), 'buyBits', mockBuyBits);
sinon.replace(require('../../common/contractUtil/getBuyPrice'), 'getBuyPrice', mockGetBuyPrice);
sinon.replace(require('../../config/chainConfig'), 'providerURL', mockConfig.providerURL);
sinon.replace(require('../../config/chainConfig'), 'simulation', mockConfig.simulation);
sinon.replace(require('../../config/chainConfig'), 'contractAddress', mockConfig.contractAddress);
sinon.replace(require('../../config/chainConfig'), 'buyGasLimit', mockConfig.buyGasLimit);
sinon.replace(require('../../config/jobsConfig'), 'staleBuyOrderMinutes', mockConfig.staleBuyOrderMinutes);
sinon.replace(require('../../config/jobsConfig'), 'warningLogIntervalMinutes', mockConfig.warningLogIntervalMinutes);
sinon.replace(require('../../config/jobsConfig'), 'preSelectSlotSleepMilliseconds', mockConfig.preSelectSlotSleepMilliseconds);

// Test cases
describe('BuyGofer', () => {
  let buyGofer;

  beforeEach(() => {
    buyGofer = new BuyGofer();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should process buy alerts', async () => {
    // Setup mock behavior
    mockFs.ensureDir.resolves();
    mockFs.readdir.resolves(['alertFile']);
    mockFs.pathExists.resolves(true);
    mockFs.readJson.resolves({ quantity: 10 });
    mockTxGofer.selectNextFreeKeySlot.resolves(0);
    mockKeyFleet.getERC20Balance.resolves(new BigNumber(100));
    mockGetBuyPrice.resolves(new BigNumber(1));

    // Call the function
    await buyGofer.processBuyAlerts();

    // Assertions
    expect(mockFs.ensureDir.called).to.be.true;
    expect(mockFs.readdir.called).to.be.true;
    expect(mockFs.pathExists.called).to.be.true;
    expect(mockFs.readJson.called).to.be.true;
    expect(mockTxGofer.selectNextFreeKeySlot.called).to.be.true;
    expect(mockKeyFleet.getERC20Balance.called).to.be.true;
    expect(mockGetBuyPrice.called).to.be.true;
  });

  it('should execute dummy buy function', async () => {
    const orderData = { quantity: 10 };
    const holderAddress = '0xHolderAddress';
    const gamerAddress = '0xGamerAddress';

    await buyGofer.dummyBuyFunction(orderData, holderAddress, gamerAddress);

    expect(mockLogger.logInfo.called).to.be.true;
  });
});
