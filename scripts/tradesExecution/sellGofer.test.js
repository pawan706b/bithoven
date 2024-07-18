const fs = require('fs-extra');
const path = require('path');
const ethers = require('ethers');
const SellGofer = require('./sellGofer');
const { expect } = require('chai');
const sinon = require('sinon');

// Mock dependencies
const mockProvider = new ethers.providers.JsonRpcProvider();
const mockLogger = { logInfo: sinon.stub(), logWarning: sinon.stub(), logError: sinon.stub() };
const mockTxGofer = { refreshPendingOrder: sinon.stub(), recordPendingOrder: sinon.stub() };
const mockSellBits = sinon.stub();
const mockGetBitsBalance = sinon.stub();

// Mock configuration
const mockConfig = {
  providerURL: 'http://localhost:8545',
  simulation: true,
  contractAddress: '0xContractAddress',
  sellGasLimit: 100000,
  staleSellOrderMinutes: 10,
  warningLogIntervalMinutes: 5,
  preSelectSlotSleepMilliseconds: 1000,
  lowBalCacheTTLMinutes: 10
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
sinon.replace(require('../../common/logger'), 'Logger', sinon.stub().returns(mockLogger));
sinon.replace(require('../../fleet/txGofer'), 'TxGofer', sinon.stub().returns(mockTxGofer));
sinon.replace(require('../../common/contractUtil/sell'), 'sellBits', mockSellBits);
sinon.replace(require('../../common/contractUtil/getBitsBalance'), 'getBitsBalance', mockGetBitsBalance);
sinon.replace(require('../../config/chainConfig'), 'providerURL', mockConfig.providerURL);
sinon.replace(require('../../config/chainConfig'), 'simulation', mockConfig.simulation);
sinon.replace(require('../../config/chainConfig'), 'contractAddress', mockConfig.contractAddress);
sinon.replace(require('../../config/chainConfig'), 'sellGasLimit', mockConfig.sellGasLimit);
sinon.replace(require('../../config/jobsConfig'), 'staleSellOrderMinutes', mockConfig.staleSellOrderMinutes);
sinon.replace(require('../../config/jobsConfig'), 'warningLogIntervalMinutes', mockConfig.warningLogIntervalMinutes);
sinon.replace(require('../../config/jobsConfig'), 'preSelectSlotSleepMilliseconds', mockConfig.preSelectSlotSleepMilliseconds);
sinon.replace(require('../../config/jobsConfig'), 'lowBalCacheTTLMinutes', mockConfig.lowBalCacheTTLMinutes);

// Test cases
describe('SellGofer', () => {
  let sellGofer;

  beforeEach(() => {
    sellGofer = new SellGofer();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should process sell alerts', async () => {
    // Setup mock behavior
    mockFs.ensureDir.resolves();
    mockFs.readdir.resolves(['alertFile']);
    mockFs.pathExists.resolves(true);
    mockFs.readJson.resolves({ quantity: 10, holderAddress: '0xHolderAddress' });
    mockTxGofer.refreshPendingOrder.resolves();
    mockGetBitsBalance.resolves(ethers.BigNumber.from(100));

    // Call the function
    await sellGofer.processSellAlerts();

    // Assertions
    expect(mockFs.ensureDir.called).to.be.true;
    expect(mockFs.readdir.called).to.be.true;
    expect(mockFs.pathExists.called).to.be.true;
    expect(mockFs.readJson.called).to.be.true;
    expect(mockTxGofer.refreshPendingOrder.called).to.be.true;
    expect(mockGetBitsBalance.called).to.be.true;
  });

  it('should execute dummy sell function', async () => {
    const orderData = { quantity: 10, holderAddress: '0xHolderAddress' };
    const gamerAddress = '0xGamerAddress';

    await sellGofer.dummySellFunction(orderData, gamerAddress);

    expect(mockLogger.logInfo.called).to.be.true;
  });
});
