# Stake tokens and earn rewards

If you want to experience this feature, click [here](http://43.128.96.69:3000/)


There is also a completely decentralized experience, but unfortunately there is a problem with CSS rendering. [HERE](http://43.128.96.69:57889/ipfs/QmexampJ4N9fnQht84FVGV8Ctk5ubqbXtHqtsu8AUuXnnp/)


# Install dependent environment

```shell
npm install
```

# Testing

run Hardhat Network
```shell
npx hardhat node
```


deploy these contracts:

```shell
hardhat run --network localhost scripts/deploy.ts
```

run the test suite:
```shell
npx hardhat test --network localhost
```

