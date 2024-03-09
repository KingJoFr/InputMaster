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

//about switch statements and logical OR https://stackoverflow.com/questions/6476994/using-or-operator-in-javascript-switch-statement
async function getAction(card){
    //issue to resolve here. I'm getting temp sometimes.
    console.log('in get action', card);
    switch(card.form){
        case 'TABLET':
        case 'CAPSULE':
            action = 'TAKE';
            return action;
        case 'SYRINGE':
            action = "INJECT";
            return action;
        case 'SPRAY(S)':
            action = 'SPRAY';
            return action;
        case 'PUFF(S)': 
            action = 'Inhale';
            return action;
        case 'PATCH':
        case 'CREAM':
        case 'OINTMENT':
            action = 'Apply';
            return action;
        case 'DROP(S)':
            action = 'DROP';
            return action;
        default:
            action = 'temp';

    }
    return action;
}
async function getTimePeriod(card){
    console.log('in gettimeperiod', card)
    // issue to resolve here. I'm only getting per week and every other day. per day is not comming up. also that should be more common
    switch(card.form){
        case 'TABLET':
        case 'CAPSULE':
            periodList = ["per day","every other day","per week"]
            break;
        case 'SYRINGE':
            periodList = ["per day","per week","per month"]
            break;
        case 'SPRAY(S)':
        case 'PUFF(S)': 
        case 'PATCH':
        case 'CREAM':
        case 'OINTMENT':
        case 'DROP(S)':
            periodList = ['per day']
        default:
            periodList=['temp'];
         
    }
    let randIndex = getRandNum(periodList.length);
    return periodList[randIndex];
    
}
async function createSig(card){
    /**
     * how to create the sig.  Pull the id from req.body._id. get route and form
     * a sig is basically action + quantity + med.form + "by/" + med.route + rate + "time(s) per" + time period
     */
    console.log("in createSig", card)
    let action = await getAction(card);
    let quantity = 1;
    let form = card.form;
    let route = card.route;
    let rate = 1
    let timePeriod = await getTimePeriod(card);
    const sigString = `${action}  ${quantity}  ${form} by ${route}  ${rate} times ${timePeriod}`
    

    return sigString;
    
}

async function getCard(){
    //this basically creates an array of the drug names
    // i want to change it to send an entire merged card so I can use it in the 
    // createSig() function.  Actually looks like I still need medsList for autocomplete so will create a function for that.
    const theMeds = await MergedDeck.find();
    
    let cardIndex = getRandNum(198)
    let card = theMeds[cardIndex]
   
    return card
}

async function getMedsList(){
    const meds = await Card.find();
    let medsList = [];
     for(let i in meds){
        medsList.push(`'${meds[i].brand}' `) //funky formating to get each medication with quotes for the array
        medsList.push(`'${meds[i].generic}'`);// which will be sent to the front end for the autocomplete function
        
    }
    console.log('medsList is', medsList)
    return [medsList]

}
function getQuantity(){
    const quantityIndex = getRandNum(3);
    const quantities = [30, 60, 90,180];
    return quantities[quantityIndex];
}
function getRandNum(num){
    return Math.floor(Math.random()*num) *Math.round(Math.random());
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

router.put('/deckBuilderSubmit', async(req,res)=>{
    console.log('req.body.brand', req.body.brand)
    await MergedDeck.findByIdAndUpdate({_id: req.body._id}, {
        form: req.body.form,
        route:req.body.route,
        brand:req.body.brand
    })
    
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
    const names = await RName.find();
    let nameList = []
    for(i=0; i<names.length; i++){
        nameList.push(names.name)

    }
    
    const message = 'everything looks good so far';
    const medsList = await getMedsList();
    const card = await getCard();
    //const medIndex = getRandNum(1) // 400 because the list contains 400 names of meds. dont' need this anymore now that the card is chosen in getCard()
    const sig =await createSig(card);
    const providerIndex = getRandNum(7);
    
    //console.log('meds',meds)
    //console.log('nameList',nameList);

    res.render('index', {
        nameList, 
        message, 
        patientCheckMessage,
        icounter,
        card,
        //medIndex
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
        medsList
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
    //const medIndex =  req.body.medIndex;
    const card =  await getcard();
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
        card,
        //medIndex, 
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
