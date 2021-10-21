var Web3 = require("web3")
const fs = require("fs")

const web3 = new Web3("https://mainnet.infura.io/v3/46a6dd4ac74b4ef9ae540d401b2f925f")
const factoryAbi = require("./UniswapData/factoryABI.json")
const pairAbi = require("./UniswapData/pairABI.json")
const erc20Abi = require("./UniswapData/ERC20ABI.json")
const uniswapFactory = new web3.eth.Contract(factoryAbi, "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f")

const etherscanAPIKey = "MCG66J86QY7S5Z942HQD5TU9NZRZTVMZAH"
const etherscanEndpoint = "https://api.etherscan.io/api?module=contract&action=getabi&address=0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413&apikey=" + etherscanAPIKey

/*
* Returns address of token0 given the address of a Uniswap pair contract.
*/
const getToken0 = async (addy) => {
    const uniswapPair = new web3.eth.Contract(pairAbi, addy)

    const token0 = await uniswapPair.methods.token0().call()
    console.log(token0)
    return token0
}
/*
* Returns address of token1 given the address of a Uniswap pair contract.
*/
const getToken1 = async (addy) => {
    const uniswapPair = new web3.eth.Contract(pairAbi, addy)

    const token0 = await uniswapPair.methods.token1().call()
    console.log(token0)
    return token0
}

/*
* Returns the total number of UniswapV2 pairs in existance.
*/
const getPairs = async () => {
    const pairsLength = await uniswapFactory.methods.allPairsLength().call()

    return pairsLength
}
/*
* Gathers all pool addresses as a list of json objects and writes json objects
* to on disk file.
*/
const getPoolAddresses = async () => {
    const numPairs = await getPairs()

    var poolAddresses = []
    for (let i = 0; i < numPairs; i++) {
        if (i % 1000 == 0) {
            console.log(i)
        }

        const currentAddress = await uniswapFactory.methods.allPairs(i).call()
        poolAddresses.push({ poolAddress: currentAddress })
    }

    const jsonString = JSON.stringify(poolAddresses)
    fs.writeFile("./UniswapData/uniswapData.json", jsonString, err => {
        if (err) {
            console.log(err)
        } else {
            console.log("Successfully wrote to file!")
        }
    })
}

/*
* Gets the contract addresses of token0 and token1 and the token names for every 
* Uniswap pair.
*/
const getTokenData = async () => {
    const jsonData = JSON.parse(fs.readFileSync("./UniswapData/uniswapData.json", "utf-8"))
    for (let i = 0; i < jsonData.length; i++) {
        // initialize pair contract object
        const uniswapPair = new web3.eth.Contract(pairAbi, jsonData[i].poolAddress)

        // get token addresses
        const token0Address = await uniswapPair.methods.token0().call()
        const token1Address = await uniswapPair.methods.token1().call()

        // initialize token contract objects
        const token0 = new web3.eth.Contract(erc20Abi, token0Address)
        const token1 = new web3.eth.Contract(erc20Abi, token1Address)

        // get token names
        const token0Name = await token0.methods.name().call()
        const token1Name = await token1.methods.name().call()

        const newObj = {
            poolAddress: jsonData[i].poolAddress,
            token0Address: token0Address,
            token0Name: token0Name,
            token1Address: token1Address,
            token1Name: token1Name
        }

        jsonData[i] = newObj
    }

    const jsonString = JSON.stringify(jsonData)
    fs.writeFile("./UniswapData/completeData.json", jsonString, err => {
        if (err) {
            console.log(err)
        } else {
            console.log("Successfully wrote to file!")
        }
    })
}
getTokenData()