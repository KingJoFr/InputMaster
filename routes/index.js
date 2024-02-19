const express = require('express');
const router = express.Router();
const RName = require('../models/NameInfo')
const ICounter = require('../models/InputCounter')
const Card = require('../models/Card') 

global.icountID = "65d139f1e58ab4e79d03e7c1"


async function getNames(){
    const nameLimit = 7 //how many random names you want in the list

    /*check if there is anything in the collection */
    const collectionExist = await RName.collection.countDocuments({},{limit: nameLimit});
    //console.log('numberOfDocuments',collectionExist);
    console.log('collectionExist', collectionExist)
    console.log('nameLimit',nameLimit);
    console.log('first test', collectionExist < nameLimit);
    if(collectionExist < nameLimit){
        console.log('in if statement');
    for(let i = 0; i < nameLimit; i++){
        console.log('in for');
        
    
        try{const response = await fetch('http://api.namefake.com/english-united-states/random');
        //console.log('response',response)
        const response2 = await response.json();
        const name = response2['name'];
        const birthday = new Date(response2['birth_data']);
        const person = {
            'name' : name,
            'birthday': birthday
        };
        console.log(person);
         //const randName = await JSON.stringify(person);
         await RName.create(person);
         //console.log('response2',response2);
    }catch(err){

        console.log(err);
    }
       
       
}
}
}
getNames();
async function getMedsList(){
    const rawMeds = await Card.find();
    let medsList = [];
    for(let i in rawMeds){
        medsList.push(rawMeds[i].brand)
        medsList.push(rawMeds[i].generic);

    }
    return medsList
}
async function getRandMed(){
    return Math.floor(Math.random()*200);
}


/*************get */
router.get('/', async(req,res)=>{
    const icounter = await ICounter.findOne({_id:icountID});
    //console.log('icounter',icounter)
    const nameList = await RName.find();
    const message = 'everything looks good';
    let medCheck = ''
    patientCheck = '';
    const medsList = await getMedsList();
    const medIndex = await getRandMed()
    console.log('medindex',medIndex);
    //console.log('meds',meds)
    //console.log('nameList',nameList);

    res.render('index', {nameList, message, patientCheck,icounter,medsList,medIndex,medCheck});

});

router.get('/nameList', async(req,res)=>{
   const nameList = await RName.find()
        res.json( nameList );

})



/************** * iterate patient *****************/
router.put('/nextPT', async(req,res)=>{
    const nameList = await RName.find();
    let icounter = await ICounter.findOne({_id:icountID});
    const nameListSize = await RName.collection.countDocuments();
    patientCheck = '';
    //console.log('namelistsize is', nameListSize)
    //console.log('icount is', icounter.icount)

    /********test if they counter is out of bounds  */
    console.log('before if icount is',icounter.icount,'is greater than',nameListSize-1, icounter.icount>nameListSize-1 )
    if (icounter.icount > (nameListSize - 2)){
        console.log('inside if')
        await ICounter.findByIdAndUpdate( icountID,{
                icount : 0
    })
        console.log('icount is after if',icounter.icount)

    }else{
        console.log('inside else')
        //console.log('position_num',req.body.position_num)
        console.log('counter is',icounter.icount)
    await ICounter.findByIdAndUpdate(icountID,{
        icount : req.body.position_num
    })
        console.log('counter is',icounter.icount)
    
    }
    res.redirect('/')
});

router.post('/submit', async(req,res)=>{

    // patient name check
    const medIndex =  await getRandMed()
    const medsList =  await getMedsList();
    console.log(medIndex, medsList)
    const icounter = await ICounter.findOne({_id:icountID})
    const nameList = await RName.find();
    const inputMed = req.body.inputMed;
    const inputName = req.body.patient;
    const medChecker = req.body.medChecker;
    const nameChecker = req.body.nameChecker;
    //console.log('inputName',inputName)
    let patientCheck = ''
    let medCheck = ''
    //console.log('patientcheck',nameList[1]['name'] != inputName)
    if(inputName != nameChecker){
            //console.log('infirst if')
         patientCheck = 'You got the wrong patient';
    } else{
       // console.log('in else')
         patientCheck = 'You got the right patient';
    }

    //medication check
    if(inputMed != medChecker){

        medCheck = 'You got the wrong med';
    }else{
        medCheck = 'You got the right med';
    }
    
    res.render('index',{patientCheck, nameList, medCheck,icounter,medsList,medIndex});

});


router.put('/reset', async(req,res)=>{
    console.log('reset is', req.body.reset);
    await ICounter.findByIdAndUpdate(icountID,{
        icount : req.body.reset
    })
    icounter = await ICounter.findById(icountID);
    console.log('counter after reset is', icounter.icount)
    res.redirect('/');
})




module.exports = router;

/*function insertICounter(){
    ICounter.create({
        icount: 0
    })
};

insertICounter();
*/
