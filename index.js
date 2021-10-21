var Web3 = require("web3")
const fs = require("fs")

const web3 = new Web3("https://mainnet.infura.io/v3/46a6dd4ac74b4ef9ae540d401b2f925f")
const factoryAbi = require("./UniswapData/factoryABI.json")
const pairAbi = require("./UniswapData/pairABI.json")
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

// fs.readFile("./uniswapData.json", "utf-8", (err, jsonString) => {
//     if (err) {
//         console.log("Error reading file from disk:", err)
//         return
//     }
//     try {
//         const myData = JSON.parse(jsonString)
//         console.log(myData)
//     } catch (err) {
//         console.log("Error parsing JSON string:", err)
//     }
// })