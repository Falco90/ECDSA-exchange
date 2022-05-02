const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("@noble/secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const numberOfAccounts = 3;
const balances = {};
const keyPairs = {};

for (let i = 0; i < numberOfAccounts; i++) {
  let privateKey = secp.utils.randomPrivateKey();
  privateKey = Buffer.from(privateKey).toString("hex");
  let publicKey = secp.getPublicKey(privateKey);
  publicKey = Buffer.from(publicKey).toString("hex");
  publicKey = "0x" + publicKey.slice(publicKey.length - 40);
  balances[publicKey] = Math.floor(Math.random() * 100 + 50);
  keyPairs[publicKey] = privateKey;
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, privateKey } = req.body;
  if (keyPairs[sender] == privateKey) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log(`Balances`, balances);
  console.log(`Public-Private keypairs:`, keyPairs);
});
