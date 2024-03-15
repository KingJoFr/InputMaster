const express = require('express');
const router = express.Router();
const RName = require('../models/NameInfo')
const ICounter = require('../models/InputCounter')
const Card = require('../models/Card') 
const DetailedCard = require('../models/DetailedCard')
const MergedDeck = require('../models/MergedDeck');


global.icountID = "65d139f1e58ab4e79d03e7c1"


//about switch statements and logical OR https://stackoverflow.com/questions/6476994/using-or-operator-in-javascript-switch-statement
async function getAction(card){
    //issue to resolve here. I'm getting temp sometimes.

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
        case 'GEL':
        case 'PUMP(S)':
        case 'WASH(ES)':
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
    
    // issue to resolve here. I'm only getting per week and every other day. per day is not comming up. also that should be more common
    switch(card.form){
        case 'TABLET':
        case 'CAPSULE':
            periodList = ["per day","every other day","per week"]
            break;
        case 'SYRINGE':
            periodList = ["per week","per month"]
            break;
        case 'SPRAY(S)':
        case 'PUFF(S)': 
        case 'PATCH':
        case 'CREAM':
        case 'OINTMENT':
        case 'DROP(S)':
        case '.':
            periodList = ['per day']
        default:
            periodList=['temp'];
         
    }
    let randIndex = getRandNum(periodList.length,Math.round(Math.random()));
    return periodList[randIndex];
    
}
async function createSig(card){
    
    /**
     * how to create the sig.  Pull the id from req.body._id. get route and form
     * a sig is basically action + quantity + med.form + "by/" + med.route + rate + "time(s) per" + time period
     * how can I improve the sig?  There are a number of medications that have a unique sig. Azithromycin for
     * instance.  9/10 times it's going to be 2 day 1 then 1 a day.  I could possible add a sig property 
     * to certain medications then check if they have a sig during sig creation.  Another thing is quantities
     * can be different depending on the type of medicine. For instance insulin could be 10,15, 20. units a day, 
     * while pills will be 1,2,3,4 a day or 2 times a day or whatever. but basically what I'm trying to say 
     * is they can't pull from the same array of quantities. I could probably use the form or route to decide which 
     * array of quantities to pull from.*/
    

  if(card.sig){
    
    const sig = card.use
     return sig
  }else{
    let action = await getAction(card);
    let quantity = 1;
    let form = card.form;
    let route = card.route;
    let rate = 1
    let timePeriod = await getTimePeriod(card);
    const sigString = `${action} ${quantity} ${form} ${route} ${rate} time(s) ${timePeriod}`;
    
    if(action=='temp' || timePeriod =='temp'){
        console.log('we have temps and card is ', card);
    }
    return sigString;
}   
   
    
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
    
    return [medsList]

}
function getQuantity(){
    const quantityIndex = getRandNum(3,Math.round(Math.random()));
    const quantities = [30, 60, 90,180];
    return quantities[quantityIndex];
}
function getRandNum(num, getZeroes = 1){
    return Math.floor(Math.random()*num * getZeroes);
}
function checker(input, checker){

    const stripChecker = checker.replaceAll("'","")
   
    if (input == stripChecker){
        return 'pass'
    }else{
        return 'fail'
    }
}
function sigCheckerFunct (inputSig,sigChecker){
    //this was originally named sigChecker, but it wasn't working when I called it.
    // Apparently it's becaue i already had a variable named sigChecker.  so it's said sigChecker wasn't a function
    const loweredInput = inputSig.toLowerCase().trim();
    const loweredChecker = sigChecker.toLowerCase().trim();
    //console.log('sigCheckerFunct:','\n', loweredInput,'\n',loweredChecker, (loweredInput==loweredChecker))
    return checker(loweredInput, loweredChecker);


}

async function getNameList(){
    const names = await RName.find();
    let nameList = [];
    
    for(i=0; i<names.length; i++){
        nameList.push(`'${names[i].name}'`)
        
    }
    return nameList
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
/*********************************deck Builder routes ***************************************8*/
router.get('/deckBuilder', async(req,res)=>{
    
    res.render('deckBuilder',);
})

router.get('/deckBuilderData', async(req,res)=>{
    //calls the deck of cards
    const cards = await MergedDeck.find();
 
    res.send(cards);
})

router.put('/deckBuilderSubmit', async(req,res)=>{
    //submits changes to card
    //have to check which sig changing.  sig one if it already has a sig in database. Sig2 if it doesn't already have sig
    let sig1 = req.body.sig;
    let sig2 = req.body.sig2;
    if(sig1){
        console.log('in sig 1')
    await MergedDeck.findByIdAndUpdate({_id: req.body._id}, {
        form: req.body.form,
        generic: req.body.generic,
        brand: req.body.brand,
        use: req.body.use,
        dea_class:req.body.dea_class,
        route:req.body.route,
        sig:req.body.sig
    })
    }else if(sig2){
        console.log('in sig 2')
        await MergedDeck.findByIdAndUpdate({_id: req.body._id}, {
            form: req.body.form,
            generic: req.body.generic,
            brand: req.body.brand,
            use: req.body.use,
            dea_class:req.body.dea_class,
            route:req.body.route,
            sig:req.body.sig2
        })
        
    }else{ // if you don't want to put a sig
        console.log('in no sig')
        await MergedDeck.findByIdAndUpdate({_id: req.body._id}, {
            form: req.body.form,
            generic: req.body.generic,
            brand: req.body.brand,
            use: req.body.use,
            dea_class:req.body.dea_class,
            route:req.body.route,
            
        })

    }
    
    res.redirect('deckBuilder')
})
router.get('/deckBuilderDataNames', async(req,res)=>{
    //to get list of patient names
    const names = await RName.find();
    res.send(names)
})
router.put('/deckBuilderNamesSubmit', async(req,res)=>{
    //to edit patient names
    await RName.findByIdAndUpdate({_id:req.body._id},{
        name: req.body.name
    })
    res.redirect('deckBuilder');
})

router.get('/deckBuilderSearch', async(req,res)=>{
    // about search https://stackoverflow.com/questions/65067626/search-bar-get-request-using-express plus chatgpt
    const searchItem = req.query.q // get query items. Remember the q matches the q in ?q=
    
    const card = await MergedDeck.findOne({$text:{$search:`${searchItem}`}});
    //console.log('called from deckbuildersearch',card);
    res.send(card);
})
//*******************************card creator routes *******************************/
router.get('/cardCreator', async(req,res)=>{
    res.render('cardCreator');
})

router.get("/dummyCard", async(req,res)=>{
    const card = await MergedDeck.findOne({generic:"dummyCard"});

    res.send(card);
})

router.post("/cardCreatorSubmit",async(req,res)=>{

    const sig2 = req.body.sig2
    const generic = req.body.generic;
    const brand = req.body.brand;
    const use = req.body.use;
    const dea_class = req.body.dea_class;
    const form = req.body.form;
    const sig = req.body.sig;
    const route =req.body.route;
    if(sig){
    const newCard = {
        "generic": generic,
        "brand": brand,
        "use": use,
        "dea_class": dea_class,
        "form": form,
        "route": route,
        "sig": sig
    }
    console.log('sig is defined')
    await MergedDeck.create(newCard);
    res.redirect('cardCreator')
}else if(sig2){
    console.log('sig2 is defined')
    const newCard = {
        "generic": generic,
        "brand": brand,
        "use": use,
        "dea_class": dea_class,
        "form": form,
        "route": route,
        "sig": sig2
    }
    res.redirect('cardCreator')
    await MergedDeck.create(newCard);
} else{
    console.log('no sig is defined')
    const newCard = {

        "generic": generic,
        "brand": brand,
        "use": use,
        "dea_class": dea_class,
        "form": form,
        "route": route,
    }
    await MergedDeck.create(newCard);
    res.redirect('cardCreator')
    
}

   
    const checkCard = await MergedDeck.findOne({generic:`${generic}`});
    //console.log('checkCard', checkCard)
})


/*****************************main routes************************************************* */
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
    
    const nameList = await getNameList();
    
    const message = 'everything looks good so far';
    const medsList = await getMedsList();
    const card = await getCard();
    //const medIndex = getRandNum(1) // 400 because the list contains 400 names of meds. dont' need this anymore now that the card is chosen in getCard()
    const sig =await createSig(card);
    
    const providerIndex = getRandNum(7,Math.round(Math.random()));
    


    res.render('index', {
        nameList, 
        message, 
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
    

    /********test if they counter is out of bounds  */
    //console.log('before if icount is',icounter.icount,'is greater than',nameListSize-1, icounter.icount>nameListSize-1 )
    if (icounter.icount > (nameListSize - 2)){
        
        await ICounter.findByIdAndUpdate( icountID,{
                icount : 0
    })
        

    }else{

    await ICounter.findByIdAndUpdate(icountID,{
        icount : req.body.position_num
    })
        
    
    }
    res.redirect('/')
});

router.post('/submit', async(req,res)=>{

    // patient name check
    
   
    const quantity = req.body.quantityChecker;
    //const medIndex =  req.body.medIndex;
    const card =  await getCard();
    const medsList = await getMedsList();
    const icounter = await ICounter.findOne({_id:icountID})
    const nameList = await getNameList();
    const providerIndex = req.body.providerIndex;
    

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
    const sigCheckMessage = sigCheckerFunct(inputSig, sigChecker );
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
        medsList,
        //medIndex, 
        quantity,
        sig, 
        providerIndex
    });

});


router.put('/reset', async(req,res)=>{
    
    await ICounter.findByIdAndUpdate(icountID,{
        icount : req.body.reset
    })
    icounter = await ICounter.findById(icountID);
    
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
