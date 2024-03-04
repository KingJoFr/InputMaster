const express = require('express');
const router = express.Router();
const RName = require('../models/NameInfo')
const ICounter = require('../models/InputCounter')
const Card = require('../models/Card') 
const DetailedCard = require('../models/DetailedCard')



global.icountID = "65d139f1e58ab4e79d03e7c1"
global.sigList = [
    'Take 1 by mouth once daily',
    'Take 1 by mouth twice daily',
]









function getSig(){
    sindex = getRandNum(sigList.length);
    return sigList[sindex];
}
async function getNames(){
    const nameLimit = 7 //how many random names you want in the list

    //check if there is anything in the collection 
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


//

function checkControlled(obj){
    if(obj['controlled_substance'] ){
        return obj['controlled_substance'][0]
    }else if(obj['drug_abuse_and_dependence']){
        return obj['drug_abuse_and_dependence'][0]
    }else{
        return '-'
    }
}
function isMedInFDA(response){
    if(response){
        return response
    }else{
        return false
    }

}
async function buildDeck(response, drugName, drugList){
    /* for some reason instead of storing the array in one object it seems to be storing each object of the 
        array into its onwn object in mongoDB. So to overcome this I put the array into an object and then store 
        the object. but how do you name the object dynamically.  You can create an empty object such as obj = {}. give a variable the 
        name of the drug in a string such as const var = `${drugList.generic}` Then put that variable as a property in the 
        object with the array as the value. such as obj{var} = response. as in the response of the fetch. */
    let medCheck = response.results;
    if(medCheck){
        
        const drug = cardAssign(drugName,medCheck)
        await DetailedCard.create(drug)
        console.log('card added')
        

    } else{
        
        console.log('card does not exist')
        return drugName
    }

}

function cardAssign(drugName,medInfo){
        let drug = {}
        drug[drugName] = medInfo;
        //console.log('drug',drug)
        return drug
        
}



async function checkMList(mList,drugList){
//I'm gonna try to take the generic name from mList to find the card in DrugList and get the brand name and search for that instead
//'hydrocodone/apap' 'oxycodone/apap' 'triamterene/hctz' 'buprenorphine/naloxone' 'codeine / apap' 'estrogen' 'thyroid' 'guiafenesin' 'nitroglycerine' 'tadalafil' 'mirtazepine' 'amphetamine/dextroamphetamine' 'zoster vaccine'
    let mList2 = []
    console.log('in checkMList');
    for(let i = 0; i<mList.length; i++){
        const drugToSearch = mList[i];
        console.log('drug to search', drugToSearch);
        const drug = await Card.find({generic: `${drugToSearch}`});
        const brand = drug[0].brand;
       
        console.log('drug.brand', brand);
        const response = await fetch(`https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:${brand}`);
        const response2 = await response.json();
        const missedDrug = await buildDeck(response2,brand);
        if(missedDrug){
            mList2.push(missedDrug);
        }

        /*if(medCheck){
        await buildDeck(medCheck, brand)
        //cardAssign(medCheck,drugToSearch)
        }else{
            mList2.push(mList[i])
        }*/
    

}
    return mList2;

}





async function callFDA(){
    /*over view. callFDA() gets a response from openfda database.  Is it valid is not known right away.
        We call buildDeck() which returns nothing and asigns the card to the deck if response is valid.
        if response is not valid then the name of the drug gets returned. which needs to be checked in
        the openfda database.  Need to consider a case where the drug is in neither database, how can we check that.*/
    //to do string interpolation use backticks like so `hello ${name}`
    
    const drugList = await Card.find(); // we call up the deck that I've already created. We query each drug in the deck
    const numDocs = await Card.countDocuments();
    
    let missingList = []; // if the query in openfda gives us nothing we store here to later query at products.active_ingredients.name:
    let missingList2 =[]; // if the missingList check gives us back something we're probably fucked. actually no. i don't believe the list will be very long. I can do them by hand

    for(let i =0; i<numDocs; i++){
        console.log('checking drug ', drugList[i].generic, ' ', drugList[i].brand);
        const response = await fetch(`https://api.fda.gov/drug/drugsfda.json?search=openfda.generic_name:${drugList[i].generic}`);
        const response2 = await response.json();

        /*sometimes openfda doensn't have the medicine with that brand name. must check first
          if they dont have the medicine what should I put? I'll just return the card from RName deck
          then add the generic form and route.  it's difficult to because all medication isn't always there
          in the brand name and the form isn't always in the same place.  Sometimes it's in description
          sometimes it's in dosage form.  after finding drugsfda instead of label I think my problem is solved
          generic name can be obtained from products[num]active_ingredients as well as the strength of each ingredient
          could possible create a function that measures the list of active ingredients then takes the strengths to come 
          up with a list of strengths. 325/5, 325/10 for example*/
        const medCheck = response2.results;
        let drugName = drugList[i].generic;
        let temp = await buildDeck(response2,drugName);
        //console.log('drug that didnt match/wasnt found', temp)
        if(temp){
            missingList.push(temp)
        }

    }
    console.log('missingList',missingList)
    missingList2 = await checkMList(missingList, drugList);
    console.log('missingList2', missingList2);
    
}
async function createMergedDeck(){
    /*https://stackoverflow.com/questions/53747498/template-literal-in-mongodb-query-with-mongoose
    how to query template literal. You have to use [] outsite of the `` backticks
    */
    const cards = await Card.find();
   
    const numCards = await Card.countDocuments()
    


    for(let i = 0; i<5; i++){
        const generic = cards[i].generic
        const brand = cards[i].brand
        const use = cards[i].use
        const dea_class = cards[i].dea_class
        console.log('drug to search', generic)
        const currentDCard = await DetailedCard.findOne({[`${generic}`] :{$exists: true}})
        if(currentDCard){
            const form =  currentDCard[`${generic}`][0].products[0].dosage_form;
        }else{
            console.log('not found')
        }
        
        //const form = currentDCard.products
        //console.log('form ', form)


        

}

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
createMergedDeck();
//callFDA();
/*************get ***********************/ // all the routes start here
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
