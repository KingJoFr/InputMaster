const express = require('express');
const router = express.Router();
const RName = require('../models/NameInfo')


async function getNames(){
    const nameLimit = 5 //how many random names you want in the list

    /*check if there is anything in the collection */
    const collectionExist = await RName.collection.countDocuments({},{limit: nameLimit});
    console.log('numberOfDocuments',collectionExist);
    if(collectionExist < nameLimit){
    for(let i = 0; i < nameLimit; i++){
        console.log('i',i);
    
    
        const response = await fetch('http://api.namefake.com/random/random');
        //console.log('response',response)
        const response2 = await response.json();
        //const randName = await JSON.stringify(response2);
        await RName.collection.insertOne(response2);
        console.log('response2',response2);
        }
}
}
getNames();
router.get('/', async(req,res)=>{
    const nameList = await RName.find();
    
    console.log('nameList',nameList);
    res.render('index', {nameList});

});

module.exports = router;