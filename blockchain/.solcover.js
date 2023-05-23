module.exports = {
    skipFiles: [
        'pancekeswap-fork',
        'v3-interfaces',
        'frogs/ERC20.sol',
        'frogs/TBnb.sol',
        'frogs/TCake.sol',
        'frogs/FrogSponsor',
        'frogs/IFrogReferal',
        // 'frogs/Random',
        // 'frogs/FrogLottery',
        // 'frogs/FrogFactory',
        // 'frogs/FrogReferal'
    ],
    configureYulOptimizer: true
};