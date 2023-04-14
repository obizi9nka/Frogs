// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Random {
    uint randNonce;

    /**
    * randMod - get random uint [0;_modulus)
    */
    function randMod(uint _modulus) private returns(uint){
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % _modulus;
    }

    /**
    * randMod - get one random uint [0;_max)
    */
    function getRandom(uint _max) private returns(uint){
        return randMod(_max);
    }

    /**
    * randMod - get _count random uint [0;_max)
    */
    function getRandomsWithRepeat(uint _max, uint _count) internal returns(uint[] memory result){
        require(_count <= _max,'Count of number must be less than max or equal');
        uint counter;
        result = new uint[](_count);

        while(counter < _count){
            uint random = getRandom(_max) + 1;
            bool exist = false;
            for(uint i = 0; i < _count; i++){
                if(result[i] == random) exist = true;
            }
            if(!exist){
                result[counter] = random;
                counter++;
            }
        }

        for(uint i = 0; i < _count; i++){
            result[i]--;
        }

        return result;
    }
}