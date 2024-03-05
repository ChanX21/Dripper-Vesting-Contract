import './App.css';
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import abi from './abi/Dripper.json';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [vestingInputAmount, setVestingInputAmount] = useState('');
  const [vestingInputRecipient, setVestingInputRecipient] = useState('');
  const [vestingInputVestingStart, setVestingInputVestingStart] = useState('');
  const [vestingInputVestingPeriod, setVestingInputVestingPeriod] = useState('');
  const [vestingInputPeriodSize, setVestingInputPeriodSize] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [contract, setContract] = useState('');
  const [signer, setSigner] = useState('');
  const [provider, setProvider] = useState('');
  const [getVestIndex, setGetVestIndex] = useState();
  const [getVestWalletAddress, setGetVestWalletAddress] = useState();
  const [vestingAgreement, setVestingAgreement] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState();
  const [withdrawWalletAddress, setWithdrawWalletAddress] = useState();
  const [withdrawIndex, setWithdrawIndex] = useState();
  const [withdrawableAmountAddress, setWithdrawableAmountAddress] = useState();
  const [withdrawableAmountIndex, setWithdrawableAmountIndex] = useState();
  const [withdrawableAmount, setWithdrawableAmount] = useState();




  // Replace with your actual provider fetching logic
  const providerFetch = async () => {
    try {
      let signer = null;

      let provider;
      if (window.ethereum == null) {

        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed,
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults")
        provider = ethers.getDefaultProvider()

      } else {

        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        provider = new ethers.BrowserProvider(window.ethereum)

        // It also provides an opportunity to request access to write
        // operations, which will be performed by the private key
        // that MetaMask manages for the user.
        signer = await provider.getSigner();
        const contract = new ethers.Contract("0x616b8c48beE78Fa3D2fcE2AD583A69f0012aed4d", abi.abi, signer);
        setContract(contract);
        setProvider(provider);
        setSigner(signer);
      }
      console.log('Provider fetched successfully');
      setSnackbarMessage('Provider fetched successfully')
    } catch (error) {
      console.error(error);
      setOpenSnackbar(true);
      setSnackbarMessage('Error fetching provider: ' + error.message);
    }
  };

  useEffect(() => {
    providerFetch();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation before submission
    if (!validateInputs()) {
      setOpenSnackbar(true);
      setSnackbarMessage('Please fill in all fields correctly.');
      return;
    }

    // Replace with your actual form submission logic
    try {
      const response = await submitForm(vestingInputAmount, vestingInputRecipient, vestingInputVestingStart, vestingInputVestingPeriod, vestingInputPeriodSize);
      console.log('Form submitted successfully:', response);
      setOpenSnackbar(true);
      setSnackbarMessage('Form submitted successfully.');
    } catch (error) {
      console.error(error);
      setOpenSnackbar(true);
      setSnackbarMessage('Error submitting form: ' + error.message);
    }
  };

  const validateInputs = () => {
    // Add validation logic for each input field based on your requirements
    return true; // Replace with your actual validation logic
  };

  const submitForm = async (amount, recipient, vestingStart, vestingPeriod, periodSize) => {
    try {
      return await contract.lockToVestAndTransfer(amount, recipient, (new Date(vestingStart).getTime())/1000, vestingPeriod, periodSize);
    } catch (e) {
      console.log(e);
    }
  };
  const submitWithdrawForm = async () => {
    try {
      console.log({withdrawWalletAddress, withdrawIndex, withdrawAmount})
      return await contract.withdraw(withdrawWalletAddress, withdrawIndex, withdrawAmount);
    }
    catch (e) {
      console.log(e);
    }
  };

  const submitWithdrawableAmountForm = async () => {
    try {
      let response = await contract.getWithdrawableAmount(withdrawableAmountAddress, withdrawableAmountIndex);
      console.log(response)
      setWithdrawableAmount(Number(response));
    }
    catch (e) {
      console.log(e);
    }
  };

  const submitGetVestForm = async () => {
    try {
      let response = await contract.getVestingAgreements(getVestWalletAddress, getVestIndex);
      setVestingAgreement({
        vestStart: Number(response[0]),
        vestPeriod: Number(response[1]),
        totalAmount: Number(response[2]),
        vestPeriodSize: Number(response[3]),
        sender: response[4],
        recipient: response[5],
        amountWithdrawn: Number(response[6]),
      })
      console.log(response);
    } catch (e) {
      console.log(e)
    }
  };

  return (
    <div className="App">
      <header className="App-header pt-5">
        <h2>BCX Vesting</h2>
        {/* <label>Enter the de</label> */}
        <form className="vesting-form mt-4" onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="amount" className="input-label">Amount:</label>
            <input
              type="number"
              id="amount"
              value={vestingInputAmount}
              onChange={(e) => setVestingInputAmount(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="input-container">
            <label htmlFor="recipient" className="input-label">Recipient:</label>
            <input
              type="text"
              id="recipient"
              value={vestingInputRecipient}
              onChange={(e) => setVestingInputRecipient(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="input-container">
            <label htmlFor="vesting-start" className="input-label">Vesting Start Time:</label>
            <input
              type="datetime-local"
              id="vesting-start"
              value={vestingInputVestingStart}
              onChange={(e) => setVestingInputVestingStart(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="d-flex justify-content-between w-100">
            <div className="vest-input-container col-6">
              <label htmlFor="vesting-period" className="input-label">Vesting Period:</label>
              <input
                type="number"
                id="vesting-period"
                value={vestingInputVestingPeriod}
                onChange={(e) => setVestingInputVestingPeriod(e.target.value)}
                required
                className="vest-period-field"
              />
            </div>
            <div className="vest-input-container col-6">
              <label htmlFor="period-size" className="input-label">Period Size:</label>
              <input
                type="number"
                id="period-size"
                value={vestingInputPeriodSize}
                onChange={(e) => setVestingInputPeriodSize(e.target.value)}
                required
                className="vest-period-field"
              />
            </div>
          </div>
          <button type="submit" className="submit-button">Submit</button>
        </form>
        <br /><div>
          <div>
            <label>Get Vest</label>
            <div> <input placeholder='Wallet Address' onChange={(e) => setGetVestWalletAddress(e.target.value)} ></input><input placeholder='Vest Number' onChange={(e) => setGetVestIndex(e.target.value)}></input> <button type="submit" className="submit-button" onClick={submitGetVestForm}>Submit</button></div>
            {vestingAgreement ? <div>
              Vesting Start Time : {new Date(vestingAgreement.vestStart * 1000).toLocaleString()} <br></br>
              Vesting Period : {vestingAgreement.vestPeriod}<br></br>
              Vesting Period Size : {vestingAgreement.vestPeriodSize}<br></br>
              Amount : {vestingAgreement.totalAmount}<br></br>
              Sender : {vestingAgreement.sender}<br></br>
              Receiver : {vestingAgreement.recipient}<br></br>
              Amount Withdraw : {vestingAgreement.amountWithdrawn}<br></br>
            </div> : <></>}
          </div>
          <div>Withdraw <br></br>
            <input placeholder='Sender Address' onChange={(e) => setWithdrawWalletAddress(e.target.value)}></input>
            <input placeholder='Index' onChange={(e) => setWithdrawIndex(e.target.value)}></input>
            <input placeholder='Amount to Withdraw' onChange={(e) => setWithdrawAmount(e.target.value)}></input>
            <button type="submit" className="submit-button" onClick={submitWithdrawForm}>Submit</button>
          </div>
          <div>Get Withdrawable Amount <br></br>
            <input placeholder='Sender Address' onChange={(e) => setWithdrawableAmountAddress(e.target.value)}></input>
            <input placeholder='Index' onChange={(e) => setWithdrawableAmountIndex(e.target.value)}></input>
            <button type="submit" className="submit-button" onClick={submitWithdrawableAmountForm}>Submit</button> <br></br>
            {withdrawableAmount? <div>Withdrawable Amount : {withdrawableAmount} </div> : <></>}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
