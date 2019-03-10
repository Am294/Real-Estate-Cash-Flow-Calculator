//Removes parentheses from string and returns as number
function convertToNum(string){

    var tempAmount=string.substr(1,string.length-2);
    return Number(tempAmount);
}

///Removes parentheses from string
function removeParen(word){
    let tempArr = (word.split(''));
    tempArr.pop();
    tempArr.shift();
    return tempArr.join('');
}

//Determines if a number is valid (Has no letters in input)
function isAscii(number){
    let numLength = number.length;

    for(let i=0;i<numLength;i++){
        let ascii = number.charCodeAt(i);
        if((ascii > 57 || ascii < 48)) {
            if(ascii != 46){
            console.log("Invalid input", number);
           let temp= {Truth:true, Location:ascii};
            return temp;
            }
        }
    }

    return false;
}

//Calculates the mortgage for a property
function monthlyPayment(price,downPayment,interestRate){
    if(downPayment >= 100) {return 0;}
    if(downPayment < 0) {downPayment=0;}

    let amountLeft = (1-(downPayment/100))*price;
    let monthlyInterest = ((interestRate/100) / 12) + 1;
    let percentOne =1 - Math.pow(monthlyInterest,-360);
    let percentTwo = (monthlyInterest-1)/(percentOne);
    return(percentTwo*amountLeft);

}

// Calculates cash flow metrics for property and returns an object with these metrics
function cashFlow(mortgage,propertyTaxRate,propertyManagement,rent,price,emergency,downPayment,interestRate){

    let help = 0;
    if(propertyManagement == "True"){help=rent*.1;}

    let monthlyExpenses = mortgage + help + rent*(emergency/100);
    let propertyTaxes = price*(propertyTaxRate/100);
    
    let totalProfit = (rent*12-monthlyExpenses*12-propertyTaxes);
    let isProfitable = true;
    if(totalProfit <  0){isProfitable = false;}

    //Rounds metrics to nearest appropriate number for a cleaner output
    monthlyExpenses =  Math.round(monthlyExpenses);
    mortgage =  Math.round(mortgage);
    propertyManagement = Math.round(help);
    propertyTaxes = Math.round(propertyTaxes);
    let emergencySavings = Math.round(emergency/100 * rent);
    let monthlyPropertyTaxes = Math.round(propertyTaxes/12);

    let annualCashFlow = 12*(rent - monthlyPropertyTaxes -monthlyExpenses );
    let cashDown = price*downPayment;
    let cashOnCash =(annualCashFlow / cashDown)*100;
    cashOnCash = cashOnCash.toFixed(2);

    let houseData = {mortgage:mortgage, rent:rent, propertyManagement:help, monthlyExpenses:monthlyExpenses, propertyTaxes:propertyTaxes,
    isProfitable:isProfitable,price:price,totalProfit:totalProfit, emergencySavings:emergencySavings,propertyTaxRate: propertyTaxRate,
    monthlyPropertyTaxes: monthlyPropertyTaxes, cashOnCash: cashOnCash, interestRate: interestRate};

    return houseData;
}





const request = require('request');
const express = require('express');
const bodyParser=require('body-parser');
const parseString = require('xml2js').parseString;
const cheerio = require('cheerio');

const app = express();

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
const ID = "X1-ZWz187cud5aryj_5f91a";



app.get("/",(req,res) =>{

   res.render("main.ejs");

});


// Route for a single property
app.get("/results",(req,res) =>{

  //Input variables from form
  let   address = req.query.address;
  let   city = req.query.city;
  let   state = req.query.state;
  let   downPayment = req.query.downPayment;
  let   propertyManager = req.query.propertyManager;
  let   propertyTaxRate = req.query.propertyTax;
  let   emergency = req.query.emergency;
  let   interestRate = req.query.interestRate;
    
  // Tests decimal numbers for valid input
  // If input is invalid the page is redirected to an error page
  let isInvalid;
   isInvalid =  isAscii(downPayment);
   if(isInvalid.Truth){res.render("error.ejs",{error:downPayment, ascii: isInvalid.Location});}
   isInvalid =  isAscii(propertyTaxRate);
   if(isInvalid.Truth){res.render("error.ejs",{error:propertyTaxRate, ascii: isInvalid.Location});}
   isInvalid =  isAscii(emergency);
   if(isInvalid.Truth){res.render("error.ejs",{error:emergency, ascii: isInvalid.Location});}
   isInvalid =   isAscii(interestRate);
   if(isInvalid.Truth){res.render("error.ejs",{error:interestRate, ascii: isInvalid.Location});}

   //Turns decimcal strings into numbers
    downPayment = parseInt(downPayment,10);
    propertyTaxRate = parseInt(propertyTaxRate,10);
    emergency = parseInt(emergency,10);
    interestRate = parseInt(interestRate,10);

   
    // Url for zillow api is assembled from form inputs
    let url="http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id="+ID+"&address="+address+"&citystatezip="+city+"%2C"+state+"&rentzestimate=true";

    console.log(url);
    let price;
    let rent;

    // Extracting data from Zillow
    request(url,function(error,response,body){

        if(!error && response.statusCode == 200){
            parseString(body, function (err, result) {

            // The purpose of the try catch statements is to prevent the program from crashing if the house on zillow doesn't have the 
            // data being requested. The try catch statements below are for fields mandatory for completing the calculations. If one
            // of these fields don't exist the program redirects the user towards an error page and informs them to try a different property.
             let temp;
             try{
               temp =  JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["zestimate"][0]
             ["amount"][0]["_"],null,1);
             price=convertToNum(temp);
             }
             catch(err){res.render("error.ejs"), {ascii: -1, error: "Unable to Retrieve Data"} ;}
             
             let rentTemp;
             try{
              rentTemp =  JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["rentzestimate"][0]
            ["amount"][0]["_"] ,null,1);
            rent=convertToNum(rentTemp);
             }
             catch(err){res.render("error.ejs"), {ascii: -1, error: "Unable to Retrieve Data"} ;}
            
             let tempLatitude;
             try{
            tempLatitude = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["address"][0]
            ["latitude"][0] ,null,1);
             }
             catch(err){res.render("error.ejs"), {ascii: -1, error: "Unable to Retrieve Data"} ;}

             let tempLongitude;
             try{
            tempLongitude = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["address"][0]
            ["longitude"][0] ,null,1);
             }
             catch(err){res.render("error.ejs"), {ascii: -1, error: "Unable to Retrieve Data"} ;}


             // The try catch statements below are for non-essential for the calculations. If one of these fields don't exist the variable
             // is filled with an arbitrary string and the program continues
            let zipCode;
            try{
            zipCode = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["address"][0]
            ["zipcode"][0],null,1);
           zipCode = removeParen(zipCode);
            }
            catch(err){zipCode = "Unknown";}

           let yearBuilt;
           try{
            yearBuilt =  JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["yearBuilt"][0],null,1);
            yearBuilt = removeParen(yearBuilt);
           }
           catch(err){yearBuilt = "Unknown";}

            let lotSize;
            try{
            lotSize = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["lotSizeSqFt"][0],null,1);
            lotSize = removeParen(lotSize);
            }
            catch(err){lotSize = "Unknown";}


            let houseSize;
            try{
            houseSize = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["finishedSqFt"][0],null,1);
            houseSize = removeParen(houseSize);
            }

            catch(err){houseSize = "Unknown";}

            let bedrooms;
            try{
            bedrooms = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["bedrooms"][0],null,1);
            bedrooms = removeParen(bedrooms);
            bedrooms = bedrooms[0];
            }
            catch(err){bedrooms = "Unkown"; }

            let bathrooms;
            try{
                bathrooms = JSON.stringify(result["SearchResults:searchresults"]["response"][0]["results"][0]["result"][0]["bathrooms"][0],null,1);
                bathrooms = removeParen(bathrooms);
                bathrooms = bathrooms[0];
                }
                catch(err){bathrooms = "Unkown";}


            let latitude = convertToNum(tempLatitude);
            let longitude = convertToNum(tempLongitude);
          

            

            let monthlyMortgage = monthlyPayment(price,downPayment,interestRate);
            
            let  profit =  cashFlow(monthlyMortgage,propertyTaxRate,propertyManager,rent,price,emergency,downPayment/100, interestRate);
    
           
          res.render("results.ejs",{profit:profit, latitude:latitude, longitude:longitude,address:address,state:state, city:city,
        price: price, zipCode:zipCode, yearBuilt: yearBuilt, houseSize:houseSize, lotSize:lotSize, bedrooms:bedrooms, bathrooms:bathrooms});
           

            });
        }
        else{console.log(error);}
    });

    
});

//Route for multiple properties.
app.get("/listings/1", (req,res) => {

    let cityListings = [];

    let city = req.query.city;
    let state = req.query.state;
    let minPrice = req.query.minPrice;
    let maxPrice = req.query.maxPrice;
    let bedrooms = req.query.bedrooms;
    let bathrooms = req.query.bathrooms;

    // The spaces in city names are changed to - so the url can accurately search for the city
    city = city.split(' ').join('-');

    
    // The zillow api doesn't have any method of searching for properties for sale with detailed parameters: price range, room choices,etc.
    // I instead scraped data off of movoto.com to find homes for sale. I then took the basic information from  the website and used
    // that to find the house with the zillow api to gather more data.
    let listUrl = "https://www.movoto.com/for-sale/"+city+"-"+state+"/type-single-family,condos,multi-family/price-"+minPrice+"-"+maxPrice+
    "/bed-"+bedrooms+"-0/bath-"+bathrooms+"-0";


    console.log(listUrl);
   request(listUrl, (error,response,html) => {
       
         if(!error && response.statusCode == 200){
            
                const $ = cheerio.load(html);

                //Used cheerio npm library to scrape data. Acts like jQuery
                $('.cardone').each(function() {
                    let houseString = ( $(this).html());

                    let addressIndex = houseString.search("addresslink") + 31;
                    let  addressEndIndex = houseString.indexOf("</span",addressIndex);
                    let address = houseString.substring(addressIndex,addressEndIndex);
       
                    let priceIndex = houseString.search("price-title") + 15;
                    let  priceEndIndex = houseString.indexOf("</span",priceIndex);
                    let price = houseString.substring(priceIndex,priceEndIndex-1);
                    
                    let photoIndex = houseString.search("pi.movoto")-8;
                    let photoEndIndex = houseString.indexOf("</div",photoIndex)-2;
                    let photo = houseString.substring(photoIndex,photoEndIndex-1);
                    
       
                   let house = {address: address, price: price, photo: photo,city:city,state:state};
                   cityListings.push(house);

                 });
               
                 
                 res.render("listings.ejs",{cityListings:cityListings});

            }

            else{
                console.log(error);
            }

          

    });

    
   
});

//Route to catch routes not defined
app.get("*", (req,res) =>{
    res.send("Invalid Page");
});

app.listen(3000, () => console.log('Listening on port 3000!'));


//INCLUDE APP>GET * TO CATCH ALL ROUTES NOT SPECIFIED