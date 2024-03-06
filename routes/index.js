const express = require('express');
const router = express.Router();
const RName = require('../models/NameInfo')
const ICounter = require('../models/InputCounter')
const Card = require('../models/Card') 
const DetailedCard = require('../models/DetailedCard')
const MergedDeck = require('../models/MergedDeck');


global.icountID = "65d139f1e58ab4e79d03e7c1"
global.sigList = [
    'Take 1 by mouth once daily',
    'Take 1 by mouth twice daily',
]

async function createSig(){
    const card = await MergedDeck.find();
    const numCards = await MergedDeck.countDocuments();

    for(i=0; i<numCards; i++){
        console.log('route and form ',card[i].route, ' ', card[i].form);
    }
    
}
//createSig();
function getSig(){
    sindex = getRandNum(sigList.length);
    return sigList[sindex];
}
async function getMedsList(){
    const rawMeds = await Card.find();
    let medsList = [];
    for(let i in rawMeds){
        medsList.push(rawMeds[i].brand)
        medsList.push(rawMeds[i].generic);

    }
    return medsList
}
function getQuantity(){
    const quantityIndex = getRandNum(3);
    const quantities = [30, 60, 90,180];
    return quantities[quantityIndex];
}
function getRandNum(num){
    return Math.floor(Math.random()*num);
}
function checker(input, checker){
    if (input == checker){
        return 'pass'
    }else{
        return 'fail'
    }
}
//createMergedDeck();
//callFDA();
/*************get ***********************/ // all the routes start here

/* how to fetch from your own api on local host https://stackoverflow.com/questions/60789223/send-data-from-node-js-to-frontend-using-pure-js */

/* let dataName = [];
let request = async () => {
    const response = await fetch('http://localhost:3000/api');
    const data = await response.json();
    dataName = data.name;
}
*/
router.get('/deckBuilder', async(req,res)=>{
    console.log('in get deckBuilder')
    res.render('deckBuilder',);
})

router.get('/deckBuilderData', async(req,res)=>{
    console.log('in get deckBuilderData')
    const cards = await MergedDeck.find();
   // console.log('cards in backend', cards)
    res.send(cards);
})

router.post('/deckBuilderSubmit', async(req,res)=>{
    console.log('submitted')
    res.redirect('deckBuilder')
})


router.get('/', async(req,res)=>{

    //check messages
    const  npiCheckMessage =''
    const  deaCheckMessage ='' 
    const quantityCheckMessage =''
    const providerCheckMessage =''
    const sigCheckMessage='' 
    const medCheckMessage = ''
    const patientCheckMessage = '';

    const quantity = getQuantity();
    const icounter = await ICounter.findOne({_id:icountID});
    //console.log('icounter',icounter)
    const nameList = await RName.find();
    const message = 'everything looks good so far';
    
    const medsList = await getMedsList();
    const medIndex = getRandNum(400) // 400 because the list contains 400 names of meds
    const sig = getSig();
    const providerIndex = getRandNum(7);
    console.log('medindex',medIndex);
    //console.log('meds',meds)
    //console.log('nameList',nameList);

    res.render('index', {
        nameList, 
        message, 
        patientCheckMessage,
        icounter,
        medsList,
        medIndex,
        medCheckMessage,
        quantity,
        sig,
        providerIndex,
        npiCheckMessage,
        deaCheckMessage,
        patientCheckMessage,
        quantityCheckMessage,
        providerCheckMessage,
        sigCheckMessage, 
    });

});

router.get('/nameList', async(req,res)=>{
   const nameList = await RName.find()
        res.json( nameList );

})



/************** * itterate patient *****************/
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
    
   
    const quantity = req.body.quantityChecker;
    const medIndex =  req.body.medIndex;
    const medsList =  await getMedsList();
    const icounter = await ICounter.findOne({_id:icountID})
    const nameList = await RName.find();
    const providerIndex = req.body.providerIndex;
    console.log('req.body.providerIndex',providerIndex)

    //form inputs
    const inputMed = req.body.inputMed;
    const inputPatient = req.body.patient;
    const inputQuantity = req.body.quantity;
    const inputSig = req.body.inputSig;
    const inputProvider = req.body.inputProvider;
    const inputNpi = req.body.inputNpi;
    const inputDea = req.body.inputDea;
    //checkers
    const medChecker = req.body.medChecker;
    const patientChecker = req.body.nameChecker;
    const quantityChecker=req.body.quantityChecker;
    const providerChecker =req.body.providerChecker;
    const sigChecker = req.body.sigChecker
    const npiChecker = '10********'
    const deaChecker = 'TL*******'
    const sig = req.body.sigChecker
    
    //check messages
    const patientCheckMessage = checker(inputPatient, patientChecker)
    const medCheckMessage = checker(inputMed,medChecker)
    const quantityCheckMessage = checker(inputQuantity, quantityChecker);
    const providerCheckMessage = checker(inputProvider, providerChecker);
    const sigCheckMessage = checker(inputSig, sigChecker )
    const npiCheckMessage = checker(inputNpi, npiChecker)
    const deaCheckMessage = checker(inputDea, deaChecker)
    
    

    //medication check
   

    
    
    res.render('index',{
        npiCheckMessage,
        deaCheckMessage,
        patientCheckMessage,
        quantityCheckMessage,
        providerCheckMessage,
        sigCheckMessage, 
        nameList, 
        medCheckMessage,
        icounter,
        medsList,
        medIndex, 
        quantity,
        sig, 
        providerIndex
    });

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
