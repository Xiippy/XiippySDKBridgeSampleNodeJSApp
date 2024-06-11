const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const posecomsdk = require('xiippy.posecomsdk.light');
const PaymentProcessingRequest = posecomsdk.PaymentProcessingRequest;
const IssuerStatementRecord = posecomsdk.IssuerStatementRecord;
const PaymentRecordCustomer = posecomsdk.PaymentRecordCustomer;
const PaymentRecordCustomerAddress = posecomsdk.PaymentRecordCustomerAddress;
const StatementItem = posecomsdk.StatementItem;
const XiippySDKBridgeApiClient = posecomsdk.XiippySDKBridgeApiClient;
const Utils = posecomsdk.Utils;
const Constants = posecomsdk.Constants;

// the express handler of the payment page
router.get('/', async (req, res) => {

  var Model = {};

  try {
    // try initiating the payment and loading the payment card screen
    Model.XiippyFrameUrl = await initiatePaymentNGetiFrameUrlAsync();
  } catch (error) {
    // show the error message, if any

    Model.ErrorText = error.message;
  }

  res.render('index', { title: 'Sample Payment Page', Model: Model });

});


const config = {
  Config_BaseAddress: "https://localhost:44340",
  Config_ApiSecretKey: "WZfDxXJuP7x47WgKkXoSJMqpSEAgfRiBvPVxWbqF4U4=",
  MerchantID: "r_cb0caf1b-54fd-4e7e-ae23-a6da2e0ad929",
  MerchantGroupID: "rg_bdffa371-be4b-41b4-a4de-e3d7b139605a"
};

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


async function initiatePaymentNGetiFrameUrlAsync() {
  const statementID = uuidv4(); // Assuming uuidv4() generates a UUID string
  const uniqueStatementID = uuidv4(); // Assuming uuidv4() generates a UUID string

  const req = new PaymentProcessingRequest();
  req.MerchantGroupID = config.MerchantGroupID;
  req.MerchantID = config.MerchantID;
  req.Amount = 2.5;
  req.Currency = "aud";
  req.ExternalUniqueID = uniqueStatementID;
  req.IsPreAuth = false;
  req.IsViaTerminal = false;
  // customer is optional
  req.Customer = new PaymentRecordCustomer();


  req.Customer.CustomerAddress = new PaymentRecordCustomerAddress();
  req.Customer.CustomerAddress.CityOrSuburb = "Brisbane";
  req.Customer.CustomerAddress.Country = "Australia";
  req.Customer.CustomerAddress.FullName = "Full Name";
  req.Customer.CustomerAddress.Line1 = "100 Queen St";
  req.Customer.CustomerAddress.PhoneNumber = "+61400000000";
  req.Customer.CustomerAddress.PostalCode = "4000";
  req.Customer.CustomerAddress.StateOrPrivince = "Qld";

  req.Customer.CustomerEmail = "dont@contact.me";
  req.Customer.CustomerName = "Full Name";
  req.Customer.CustomerPhone = "+61400000000";





  req.IssuerStatementRecord = new IssuerStatementRecord();
  req.IssuerStatementRecord.UniqueStatementID = uniqueStatementID;
  req.IssuerStatementRecord.RandomStatementID = statementID;
  req.IssuerStatementRecord.StatementCreationDate = Date.now().toString();
  req.IssuerStatementRecord.StatementTimeStamp = getCurrentDateTime(); // Format: yyyyMMddHHmmss

  req.IssuerStatementRecord.Description = "Test transaction #1";
  req.IssuerStatementRecord.DetailsInBodyBeforeItems = "Description on the receipt before items";
  req.IssuerStatementRecord.DetailsInBodyAfterItems = "Description on the receipt after items";
  req.IssuerStatementRecord.DetailsInFooter = "Description on the footer";
  req.IssuerStatementRecord.DetailsInHeader = "Description on the header";
  req.IssuerStatementRecord.TotalAmount = 44;
  req.IssuerStatementRecord.TotalTaxAmount = 4;

  var StatementItem1 = new StatementItem();

  StatementItem1.Description = "Description";
  StatementItem1.UnitPrice = 11;
  StatementItem1.Url = "Url";
  StatementItem1.Quantity = 1;
  StatementItem1.Identifier = "Identifier";
  StatementItem1.Tax = 1;
  StatementItem1.TotalPrice = 11;

  var StatementItem2 = new StatementItem();
  StatementItem2.Description = "Description2";
  StatementItem2.UnitPrice = 33;
  StatementItem2.Url = "Url2";
  StatementItem2.Quantity = 1;
  StatementItem2.Identifier = "Identifier2";
  StatementItem2.Tax = 3;
  StatementItem2.TotalPrice = 33;


  req.IssuerStatementRecord.StatementItems = [];
  req.IssuerStatementRecord.StatementItems.push(StatementItem1);
  req.IssuerStatementRecord.StatementItems.push(StatementItem2);



  const client = new XiippySDKBridgeApiClient(true, config.Config_ApiSecretKey, config.Config_BaseAddress, config.MerchantID, config.MerchantGroupID);
  const response = await client.InitiateXiippyPayment(req);

  const queryString = Utils.BuildQueryString({
    [Constants.QueryStringParam_rsid]: response.RandomStatementID,
    [Constants.QueryStringParam_sts]: response.StatementTimeStamp,
    [Constants.QueryStringParam_ca]: response.ClientAuthenticator,
    [Constants.QueryStringParam_spw]: "true", // show plain view
    [Constants.QueryStringParam_MerchantID]: config.MerchantID,
    [Constants.QueryStringParam_MerchantGroupID]: config.MerchantGroupID, // important
    [Constants.QueryStringParam_cs]: response.ClientSecret,
    [Constants.QueryStringParam_ShowLongXiippyText]: "true" // show the long xiippy description text
  });

  const fullPaymentPageUrl = `${config.Config_BaseAddress}/Payments/Process?${queryString}`;
  console.log(`The payment page can be browsed at '${fullPaymentPageUrl}'`);
  return fullPaymentPageUrl;
}


module.exports = router;
