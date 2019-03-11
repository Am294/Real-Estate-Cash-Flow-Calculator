Here is the link to the app on heroku: https://real-estate-cash-flow.herokuapp.com/

The real estate cash flow calculator gives users the ability to estimate cash flow for a real estate property and to search
current houses for sale and estimate cashflow instantly.

The individual property calcualtor allows users to get an accurate estimation of cash flow for a specific property. Once the user inputs
several facts about their financing and managing of the property, they are taken to a page with numerous metrics for their property. 
In addition to these metrics, the user gets additional information on the house along with a 3d google maps street view image of the house.
The data for this portion was obtained using the Zillow API.

The city wide property search allows users to search properties currently for sale in a city and receive estimations on cash flow. 
The user provides parameters to help define a house they would like: price range, bedrooms, bathrooms,etc. With this information, 
movoto.com is scrapped for current real estate listings . These properties are then presented to the user with a brief
description. From here, the user can click on a property to get more detailed information on the property, provided by the Zillow API.
