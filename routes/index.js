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
        //console.log('response2',response2);
        }
}
}
getNames();

router.get('/', async(req,res)=>{
    const nameList = await RName.find();
    const message = 'everything looks good';
    patientCheck = '';
    //console.log('nameList',nameList);

    res.render('index', {nameList, message, patientCheck});

});

router.post('/submit', async(req,res)=>{

    // patient name check
    const nameList= await RName.find();
    const inputName = req.body.patient;
    console.log('inputName',inputName)
    let patientCheck = ''
    console.log('patientcheck',nameList[1]['name'] != inputName)
    if(nameList[1]['name'] != inputName){
            //console.log('infirst if')
         patientCheck = 'You got the wrong patient';
    } else{
       // console.log('in else')
         patientCheck = 'You got the right patient';
    }

    //medication check
    
    res.render('index',{patientCheck, nameList});

});

module.exports = router;