// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Random {
    /**
    * randMod - get random uint [0;_modulus)
    */
    function randMod(uint _modulus) private view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % _modulus;
    }

    /**
    * randMod - get one random uint [0;_max)
    */
    function getRandom(uint _max) private view returns(uint){
        return randMod(_max);
    }

    /**
    * randMod - get _count random uint [0;_max)
    */
    function getRandomsWithRepeat(uint _max, uint _count) internal view returns(uint[] memory result){
        // require(_count <= _max,'Count of number must be less than max or equal');
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